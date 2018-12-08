# Debian Terminal Utility

- [Debian Terminal Utility](#debian-terminal-utility)
  - [Package Management](#package-management)
    - [Search a Particular Package](#search-a-particular-package)
    - [List All Installed Packages](#list-all-installed-packages)
    - [Remove Packages](#remove-packages)
    - [Switch Package Version](#switch-package-version)
    - [References](#references)
  - [File Searching](#file-searching)
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

### References

1. https://askubuntu.com/questions/151941/how-can-you-completely-remove-a-package
2. https://askubuntu.com/questions/160897/how-do-i-search-for-available-packages-from-the-command-line

## File Searching

To search file names for `$FILE_NAME`, do:

```sh
find / | grep $FILE_NAME
```

To search file content for `$REGEX`, do:

```sh
grep -r $REGEX
```

## Environment Settings

### Export Customized Settings

Export customized environment variables in `~/.bashrc` of `~/.profile`.

* `~/.bashrc` is executed whenever a shell is launched
* `~/.profile` is executed upon login
* `/etc/profile` is executed first after the boot

### Important Environment Variables

* `PATH` stores all the bin directories
* `LD_LIBRARY_PATH` stores all the lib directories
* `PYTHONPATH` stores paths for python modules

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