# Massive File Renamer
A web app that can be used to build a batche file that will massively rename your file names.

While developing this, the aim was to learn and to play a bit with the HTML5 File API + drag and drop features.
Due to security reasons, the File API can't rename files by itself.
Instead, I solved this by building a script file that includes all needed OS (Windows or UNIX) renaming commands, so the user only needs to run the script and the magic is done automatically.

It may not be the best solution, but at least it doesn't need any installation, it's multiplatform and proves the potential of web technologies :-)


Exporting file is thanks to [FileSaver.js by eligrey](https://github.com/eligrey/FileSaver.js/)
