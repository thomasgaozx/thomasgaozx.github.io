# Debian Terminal Utility

## Package Management
#### Search a Particular Package
```sh
apt-cache search $PACKAGE_NAME
apt-cache search $PACKAGE_NAME | less # long list
apt-cache search . # show all
```
#### List All Installed Packages
Ubuntu 14.04:
```sh
apt list --installed
```
Older Versions:
```sh
dpkg-query -l
```
#### Remove Packages
```sh
apt-get purge $PACKAGE_NAME
apt-get --purge remove $PACKAGE_NAME
```
Does the same thing and removes the installed package. The package itself is removed but its dependencies are not. To completely remove the dependencies after purging, do
```sh
sudo apt-get autoremove
sudo apt-get --purge autoremove
```
The second command is more thorough as it deletes the systemwide configuration files too.

#### References
1. https://askubuntu.com/questions/151941/how-can-you-completely-remove-a-package
1. https://askubuntu.com/questions/160897/how-do-i-search-for-available-packages-from-the-command-line
## File Searching
To search file names for `$FILE_NAME`, do:
```sh
find / | grep $FILE_NAME
```
To search file content for `$REGEX`, do:
```sh
grep -r $REGEX
```