---
---

# Bash!

- [Bash!](#bash)
  - [Bash Tools on Windows!](#bash-tools-on-windows)
  - [Package Management](#package-management)
    - [Search a Particular Package](#search-a-particular-package)
    - [List All Installed Packages](#list-all-installed-packages)
    - [Remove Packages](#remove-packages)
    - [Switch Package Version](#switch-package-version)
    - [Install from tar](#install-from-tar)
  - [File Searching](#file-searching)
    - [File Name Search](#file-name-search)
    - [File Content Search](#file-content-search)
    - [Which?](#which)
  - [Parallel Rsync!](#parallel-rsync)
  - [Setting up Automatic SSH Authentication](#setting-up-automatic-ssh-authentication)
    - [Step 1. Generating Key on Host Machine](#step-1-generating-key-on-host-machine)
    - [Step 2. Setting SSH Configuration File on Host Machine](#step-2-setting-ssh-configuration-file-on-host-machine)
    - [Step 3. Setting Authorized Key File on Target Machine](#step-3-setting-authorized-key-file-on-target-machine)
  - [Detach Programs From Shells/Sessions](#detach-programs-from-shellssessions)
  - [Environment Settings](#environment-settings)
    - [Export Customized Settings](#export-customized-settings)
    - [Important Environment Variables](#important-environment-variables)
  - [Setting Static IP Address](#setting-static-ip-address)
  - [Other cool stuff](#other-cool-stuff)

## Bash Tools on Windows!

> Warning: _massive_ rant before the useful stuff.

Windows, yiiiiiikes!! Why? Well, for me personally ...

- The native Command prompt is beyond saving.
- Cygwin is buggy and has tons of compatibility issues with its "virtual environment".
- WSL is slightly better but requires you to install basic tools like git and everything all over again! Moreover, it has many incompatibility issues with permissions setting, file path conversion (if it mingles with random windows executable), and requires a lot of shenanigans settings to get up and running semi-properly.
- All the proprietary GUI software ... or the outdated open-source ones that prompts you "An error occured" with zero explanation or debugging info.
  Although I guess if you're doing graphics design or 3D modeling/animation, you can't escape this fate.

Turns out Git bash is my best friend, despite being somewhat slower than WSL.
It is lightweight, user friendly, not overly-ambitious, and doesn't have messed up virtual environment settings.
Turns out, many basic tools that Windows _desparately_ lack are in Git bash, or are compatible with it.

Here is how to install rsync.

1. Install git bash (which has mingw support)
2. Go to official pacman repo http://repo.msys2.org/msys/, find the package for rsync, for 64 bit system it is http://repo.msys2.org/msys/x86_64/rsync-3.1.3-1-x86_64.pkg.tar.xz
3. `curl -LO http://repo.msys2.org/msys/x86_64/rsync-3.1.3-1-x86_64.pkg.tar.xz` in git bash or windows cmd
4. Decompress the package using 7-zip, and find the `rsync.exe` from bin
5. Move `rsync.exe` to `C:/Program File/git/usr/bin`

I also verified that GNU `parallel` is perfectly compatible, too!

## Package Management

### Search a Particular Package

```sh
apt-cache search $PACKAGE_NAME
apt-cache search $PACKAGE_NAME | less # long list
apt-cache search . # show all
```

### List All Installed Packages

Ubuntu 14.04:

```sh
apt list --installed
```

Older Versions:

```sh
dpkg-query -l
```

### Remove Packages

```sh
apt-get purge $PACKAGE_NAME
apt-get --purge remove $PACKAGE_NAME
```

Does the same thing and removes the installed package. The package itself is removed but its dependencies are not. 
To completely remove the dependencies after purging, do

```sh
sudo apt-get autoremove
sudo apt-get --purge autoremove
```

### Switch Package Version

```sh
sudo update-alternatives --config $PACKAGE_NAME
# select version interactively
```

The second command is more thorough as it deletes the systemwide configuration files too.

```sh
sudo update-alternatives --install /usr/bin/npm  npm /usr/local/bin/npm 10
sudo update-alternatives --install /usr/bin/npm  npm /usr/share/npm/bin/npm-cli.js 20
sudo update-alternatives --install /usr/bin/iperf3 iperf3 /home/tgao/iperf-3.7/src/iperf3 1
```

If update-alternatives doesn't seem to change the version of the app, one may need to change \$PATH to make sure `/usr/bin` occurs before `/usr/local/bin`.
`$PATH` is set in `/etc/environment`.

### Install from tar

```bash
curl -LO https://downloads.es.net/pub/iperf/iperf-3.7.tar.gz
tar zxf iperf-3.7.tar.gz
cd iperf-3.7
./configure
make
sudo make install
```

To do the install in a user directory without sudo:

```bash
cd iperf-3.7
./configure --prefix=$HOME/usr_install
make
make install
```

alternatively:

```bash
curl -LO https://downloads.es.net/pub/iperf/iperf-3.7.tar.gz
tar zxf iperf-3.7.tar.gz
cd iperf-3.7
auto-apt run ./configure
make
sudo checkinstall
```

RUN cd iperf-3.7 && ./configure --prefix=/usr/local --bindir /usr/local/bin && make && make install

## File Searching

### File Name Search

To search file names for `$FILE_NAME`, do:

```sh
find / | grep $FILE_NAME
```

### File Content Search

To search file content for `$REGEX` recursively under a `$DIR`:

```sh
grep -r $REGEX $DIR # recursive
```

To non-recursively search file content, either:

```bash
shopt -s dotglob # make a glob include hidden files
grep -s $REGEX $DIR/*
```

Or

```bash
grep -s $REGEX $DIR/{*,.*} # to include hidden files
```

### Which?

```sh
which -a <executable name> # gives a list of executable names
```

## Parallel Rsync!

```bash
cd some_dir
ls -1 | parallel -j 24 rsync -avzhP {} dev@192.168.0.2:~/
```

Side note: one can run `rsync` with `R` flag to make sure it creates directory recursively when necessary.


## Setting up Automatic SSH Authentication

### Step 1. Generating Key on Host Machine

```ssh
cd ~/.ssh
ssh-keygen -f [$ID_FILE_NAME] -t [$ALGORITHM_TYPE]
```

### Step 2. Setting SSH Configuration File on Host Machine

```bash
$ gedit ~/.ssh/config
# input target information
```

Put in the target information in the following format:

```config
Host [$TARGET_IP]
    User [$DEFAULT_USER]
    IdentityFile [$ID_FILE_NAME]
```

Note that $ID_FILE_NAME is the same as the $ID_FILE_NAME in Step 1. If you use the default identity file (i.e. the id_rsa file), you don't need to put the IdentityFile line in ssh config.

### Step 3. Setting Authorized Key File on Target Machine

First, on the host machine, copy the content of the public key that is generated in Step 1.
Then, on the target machine, paste the content of the public key to the ~/.ssh/authorized_keys file

```sh
$ vi ~/.ssh/authorized_keys
$ # paste the content
```

After you are done, don't forget to change the file permission.

```bash
chmod 755 authorized_keys
```

Alternatively, you could do the following:

```bash
scp ~/.ssh/some_key.pub $TARGET_IP:~/.ssh/authorized_keys
```

Related Readings:

1. https://www.ssh.com/ssh/config/
2. https://www.ssh.com/ssh/keygen/
3. https://confluence.atlassian.com/bitbucketserver/creating-ssh-keys-776639788.html

## Detach Programs From Shells/Sessions

A lot of the times, when you logout of a remote desktop session, or close a secure shell session, the program that is running in the background with `&` is also terminated.
To keep the program running, run:

```bash
nohup <COMMAND> &
disown
```

With these, as long as the machine is running, the program will continue to run until it's naturally terminated or encountered exception.
To check the output of the command/program, find `nohup.out`.

## Environment Settings

### Export Customized Settings

Export customized environment variables in `~/.bashrc` of `~/.profile`.

- `~/.bashrc` is executed whenever a shell is launched
- `~/.profile` is executed upon login
- `/etc/profile` is executed first after the boot

### Important Environment Variables

- `PATH` stores all the bin directories
- `LD_LIBRARY_PATH` stores all the lib directories
- `PYTHONPATH` stores paths for python modules

## Setting Static IP Address

```bash
ifconfig eth0 inet 192.168.0.20/24
```

Put this line in `/etc/profile`, and the static ip address will init after the boot.

## Other cool stuff

Go to last visited directory:

```bash
cd -
```

Additional References:

1. https://askubuntu.com/questions/151941/how-can-you-completely-remove-a-package
2. https://askubuntu.com/questions/160897/how-do-i-search-for-available-packages-from-the-command-line