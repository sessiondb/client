// Copyright (c) 2026 Sai Mouli Bandari Licensed under Business Source License 1.1.
import * as monaco from 'monaco-editor';

export interface SchemaColumn {
    name: string;
    dataType: string;
}

export interface SchemaTable {
    name: string;
    columns: SchemaColumn[];
}

export interface SchemaDatabase {
    database: string;
    tables: SchemaTable[];
}

export interface CompletionContext {
    type: 'TABLE' | 'COLUMN' | 'KEYWORD' | 'UNKNOWN';
    prefix: string;
    triggerChar: string | null;
    referencedTables: { db: string | null; name: string; alias: string | null }[];
    scope?: {
        schema?: string;
        tableOrAlias?: string;
    };
}

/**
 * Extract tables and aliases from the query.
 */
const extractTables = (sql: string) => {
    const tables: { db: string | null; name: string; alias: string | null }[] = [];

    // Normalize string
    const cleanSql = sql.replace(/--.*$/gm, ' ').replace(/\s+/g, ' ');

    // Regex to find FROM/JOIN clauses
    const regex = /\b(?:FROM|JOIN)\s+([a-zA-Z0-9_.]+(?:\.[a-zA-Z0-9_.]+)?)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?/gi;

    let match;
    while ((match = regex.exec(cleanSql)) !== null) {
        const fullTableName = match[1];
        let alias: string | null = match[2] || null;

        // Check if "alias" is actually a keyword (meaning no alias was present)
        if (alias && ['WHERE', 'GROUP', 'ORDER', 'LIMIT', 'JOIN', 'ON', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'HAVING', 'SET', 'VALUES'].includes(alias.toUpperCase())) {
            alias = null;
        }

        const parts = fullTableName.split('.');
        if (parts.length === 2) {
            tables.push({ db: parts[0], name: parts[1], alias: alias || null });
        } else {
            tables.push({ db: null, name: fullTableName, alias: alias || null });
        }
    }
    return tables;
};

/**
 * Analyze cursor context to determine what to suggest.
 */
const analyzeContext = (model: any, position: any): CompletionContext => {
    const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
    });

    const fullText = model.getValue();
    const word = model.getWordUntilPosition(position);

    // Check for dot trigger
    const lineContent = model.getLineContent(position.lineNumber);
    const charBefore = lineContent.charAt(position.column - 2);
    const isDotTrigger = charBefore === '.';

    // Extract meaningful tables from the *entire* query
    const referencedTables = extractTables(fullText);

    if (isDotTrigger) {
        // Find the word preceding the dot
        const wordMatch = textUntilPosition.match(/([a-zA-Z0-9_]+)\.$/);
        const identifier = wordMatch ? wordMatch[1] : '';

        return {
            type: 'COLUMN', // Could be TABLE if identifier is a schema
            prefix: '',
            triggerChar: '.',
            referencedTables,
            scope: {
                tableOrAlias: identifier
            }
        };
    }

    // Identify Clause Context
    // We look at the LAST "keyword" before the cursor to guess what's expected
    // Normalize newlines to spaces for regex
    const textBefore = textUntilPosition.replace(/\s+/g, ' ').toUpperCase();

    // Find all keywords
    const keywordRegex = /\b(SELECT|FROM|JOIN|UPDATE|DELETE|WHERE|GROUP\s+BY|ORDER\s+BY|HAVING|ON|SET|VALUES)\b/gi;
    const matches = textBefore.match(keywordRegex);
    const lastKeyword = matches ? matches[matches.length - 1].toUpperCase() : '';

    let type: CompletionContext['type'] = 'UNKNOWN';

    if (['FROM', 'JOIN', 'UPDATE', 'DELETE', 'DELETE FROM'].some(k => lastKeyword.includes(k))) {
        type = 'TABLE';
    } else if (['SELECT', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'ON', 'SET'].some(k => lastKeyword.includes(k))) {
        type = 'COLUMN';
    }

    return {
        type,
        prefix: word.word,
        triggerChar: null,
        referencedTables,
    };
};

export const createSqlCompletionProvider = (monaco: any, schemaRef: any) => {
    return {
        triggerCharacters: ['.'],
        provideCompletionItems: (model: any, position: any) => {
            const context = analyzeContext(model, position);
            const suggestions: any[] = [];
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - context.prefix.length,
                endColumn: position.column
            };

            const schemaData = schemaRef.current;

            // --- 1. Handle Dot Trigger (Scoping) ---
            if (context.triggerChar === '.') {
                const identifier = context.scope?.tableOrAlias;

                if (identifier) {
                    // Check if identifier is an ALIAS or Table Name from our referenced tables
                    const refTable = context.referencedTables.find(t => t.alias === identifier || t.name === identifier);

                    if (refTable) {
                        // It's a known table/alias -> Suggest Columns for this table
                        schemaData?.databases?.forEach((db: any) => {
                            // If we know the DB, filter by it. If not, search all.
                            if (refTable.db && db.database !== refTable.db) return;

                            const table = db.tables?.find((t: any) => t.name === refTable.name);
                            if (table) {
                                table.columns?.forEach((col: any) => {
                                    suggestions.push({
                                        label: col.name,
                                        kind: monaco.languages.CompletionItemKind.Field,
                                        detail: `${col.dataType} (${table.name})`,
                                        insertText: col.name,
                                        range: range
                                    });
                                });
                            }
                        });
                        return { suggestions: suggestions };
                    }

                    // Check if identifier is a Schema (Database)
                    const dbMatch = schemaData?.databases?.find((db: any) => db.database === identifier);
                    if (dbMatch) {
                        // Suggest Tables
                        dbMatch.tables?.forEach((table: any) => {
                            suggestions.push({
                                label: table.name,
                                kind: monaco.languages.CompletionItemKind.Class,
                                detail: `Table in ${dbMatch.database}`,
                                insertText: table.name,
                                range: range
                            });
                        });
                        return { suggestions: suggestions };
                    }

                    // Fallback: Check if identifier is a Table Name (global search) -> Suggest Columns
                    let tableFound = false;
                    schemaData?.databases?.forEach((db: any) => {
                        const table = db.tables?.find((t: any) => t.name === identifier);
                        if (table) {
                            tableFound = true;
                            table.columns?.forEach((col: any) => {
                                suggestions.push({
                                    label: col.name,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                    detail: `${col.dataType} (${table.name})`,
                                    insertText: col.name,
                                    range: range
                                });
                            });
                        }
                    });
                    if (tableFound) return { suggestions: suggestions };
                }
                return { suggestions: [] };
            }

            // --- 2. Handle Clause Context (No Dot) ---

            // Allow keywords + context specific items
            const keywords = [
                'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'OFFSET',
                'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'TABLE',
                'DROP', 'ALTER', 'INDEX', 'VIEW', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
                'ON', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AND', 'OR',
                'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'HAVING', 'CASE', 'WHEN',
                'THEN', 'ELSE', 'END', 'EXISTS', 'UNION', 'ALL', 'PRIMARY', 'KEY', 'FOREIGN',
                'REFERENCES', 'DEFAULT', 'CONSTRAINT', 'CHECK', 'UNIQUE', 'Show', 'describe'
            ];

            keywords.forEach(kw => {
                suggestions.push({
                    label: kw,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: kw,
                    range: range
                });
            });

            if (context.type === 'TABLE' || context.type === 'UNKNOWN') {
                // Suggest Tables & Schemas
                schemaData?.databases?.forEach((db: any) => {
                    suggestions.push({
                        label: db.database,
                        kind: monaco.languages.CompletionItemKind.Module,
                        detail: 'Database',
                        insertText: db.database,
                        range: range
                    });

                    db.tables?.forEach((table: any) => {
                        suggestions.push({
                            label: table.name,
                            kind: monaco.languages.CompletionItemKind.Class,
                            detail: `Table in ${db.database}`,
                            insertText: table.name,
                            range: range
                        });
                        // Also suggest schema.table
                        suggestions.push({
                            label: `${db.database}.${table.name}`,
                            kind: monaco.languages.CompletionItemKind.Class,
                            detail: `Full Path`,
                            insertText: `${db.database}.${table.name}`,
                            range: range
                        });
                    });
                });
            }

            if (context.type === 'COLUMN' || context.type === 'UNKNOWN') {
                // Suggest Aliases defined in query
                context.referencedTables.forEach(t => {
                    if (t.alias) {
                        suggestions.push({
                            label: t.alias,
                            kind: monaco.languages.CompletionItemKind.Variable,
                            detail: `Alias for ${t.name}`,
                            insertText: t.alias,
                            range: range
                        });
                    }
                });

                // Suggest Columns from Referenced Tables (High Priority)
                schemaData?.databases?.forEach((db: any) => {
                    context.referencedTables.forEach(refT => {
                        // Match table by name or alias
                        if ((refT.db && refT.db !== db.database)) return;

                        const table = db.tables?.find((t: any) => t.name === refT.name);
                        if (table) {
                            table.columns?.forEach((col: any) => {
                                suggestions.push({
                                    label: col.name,
                                    kind: monaco.languages.CompletionItemKind.Field,
                                    detail: `${col.dataType} (${table.name})`,
                                    insertText: col.name,
                                    sortText: '0_priority', // Sort to top
                                    range: range
                                });
                            });
                        }
                    });
                });

                // If purely unknown, maybe suggest all columns? 
                // DataGrip usually doesn't flood unless configured.
                // Let's stick to prioritising referenced tables, but also include others with lower priority if UNKNOWN?
                // For now, let's keep it clean to avoid noise.
            }

            return { suggestions: suggestions };
        }
    };
};
