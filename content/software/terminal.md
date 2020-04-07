---
---

# Debian Terminal Utility

- [Debian Terminal Utility](#debian-terminal-utility)
  - [Package Management](#package-management)
    - [Search a Particular Package](#search-a-particular-package)
    - [List All Installed Packages](#list-all-installed-packages)
    - [Remove Packages](#remove-packages)
    - [Switch Package Version](#switch-package-version)
    - [Install from tar](#install-from-tar)
  - [File Searching](#file-searching)
  - [Setting up Automatic SSH Authentication](#setting-up-automatic-ssh-authentication)
    - [Step 1. Generating Key on Host Machine](#step-1-generating-key-on-host-machine)
    - [Step 2. Setting SSH Configuration File on Host Machine](#step-2-setting-ssh-configuration-file-on-host-machine)
    - [Step 3. Setting Authorized Key File on Target Machine](#step-3-setting-authorized-key-file-on-target-machine)
  - [Detach Programs From Shells/Sessions](#detach-programs-from-shellssessions)
  - [Environment Settings](#environment-settings)
    - [Export Customized Settings](#export-customized-settings)
    - [Important Environment Variables](#important-environment-variables)
  - [Setting Static IP Address](#setting-static-ip-address)
  - [Additional Useful Tricks](#additional-useful-tricks)
    - [Go To Last Visited Directory](#go-to-last-visited-directory)

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

If update-alternatives doesn't seem to change the version of the app, one may need to change $PATH to make sure `/usr/bin` occurs before `/usr/local/bin`.
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

To search file names for `$FILE_NAME`, do:

```sh
find / | grep $FILE_NAME
```

To search file content for `$REGEX`, do:

```sh
grep -r $REGEX
```

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
ifconfig wm0 inet 192.168.0.20/24
```

## Additional Useful Tricks

### Go To Last Visited Directory

```bash
cd -
```

Put this line in `/etc/profile`, and the static ip address will init after the boot.

Additional References:

1. https://askubuntu.com/questions/151941/how-can-you-completely-remove-a-package
2. https://askubuntu.com/questions/160897/how-do-i-search-for-available-packages-from-the-command-line