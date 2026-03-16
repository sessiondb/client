# SessionDB Installation Guide

This guide covers how to easily install, configure, and manage a SessionDB instance using the official **SessionDB CLI (`scli`)**.

## 🚀 1-Line Installation

The recommended and fastest way to install the SessionDB CLI is via the install script. It downloads the latest binary and adds it to your shell path (`/usr/local/bin` if writable, otherwise `~/.local/bin`).

```bash
curl -sSL https://raw.githubusercontent.com/sessiondb/scli/main/install.sh | bash
```

To install a specific version of `scli`:

```bash
curl -sSL https://raw.githubusercontent.com/sessiondb/scli/main/install.sh | bash -s -- v1.0.0
```

> [!NOTE]
> After installation, you may need to open a new terminal or run `source ~/.zshrc` (or `~/.bashrc`) so that `scli` is available on your `$PATH`.

## Other Installation Options

### Install via Go (from source)
If you have a Go environment set up, you can install directly from the source repository:

```bash
go install .
export PATH="$PATH:$(go env GOPATH)/bin"
```

### Manual Binary Installation
1. Go to the [Releases](https://github.com/sessiondb/scli/releases) page.
2. Download the binary matching your OS and architecture.
3. Place the binary in a directory on your `$PATH`.
4. Name the binary `scli` (or `scli.exe` on Windows).
5. Open a terminal and run `scli --help` to verify.

---

## First-Time Setup Flow

Once `scli` is installed, you can initialize and deploy the full SessionDB application in a few short steps.

1. **Initialize Configuration:**  
   `scli init` will start an interactive prompt to connect to your PostgreSQL (Metadata DB) and Redis instances. It generates secrets and creates a single `config.toml` file (which is the source of truth for the server configuration).
   
2. **Download SessionDB Engine:**  
   `scli install v1.0.1` downloads the corresponding backend binary and frontend UI dist payloads for SessionDB and stages them in your active install directory.
   
3. **Deploy (e.g., to Bare Metal with Systemd):**  
   Configure SessionDB to run as a persistent background service automatically.
   
   ```bash
   scli deploy --platform baremetal --output sessiondb.service
   ```
   
   This outputs a systemd service file. Then enable it:
   
   ```bash
   sudo cp sessiondb.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable sessiondb
   sudo systemctl start sessiondb
   ```

4. **Run Database Migrations:**  
   Apply the target backend schema against your new database instance.
   
   ```bash
   scli migrate
   ```

5. **Verify Status:**  
   Check the health of the locally running service.
   
   ```bash
   scli status
   ```

---

## Install Directory Structure

The CLI heavily manages and structures the root installation paths for isolation and safe rollbacks.

- **Install root path:** Default is `/opt/sessiondb` (when running as root) or `$HOME/.local/share/sessiondb`. You can override this using the `SESSIONDB_INSTALL_ROOT` environment variable.
- **Directory Layout:**
  - `versions/<tag>/`: Contains the backend binary, frontend dist, setup scripts, and configurations specific to a version.
  - `current`: A dynamic symlink pointing directly to `versions/<installed-tag>`.
- **Checksum Security:** If a downloaded release contains `checksums.txt`, all backend and frontend artifacts are strongly verified with SHA256 before extraction.
