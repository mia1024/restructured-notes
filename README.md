# Description
![Test](https://github.com/mia1024/restructured-notes/workflows/Test/badge.svg?branch=dev)

Restructured Notes is a cross-platform project aiming to replace some of the existing note-taking software. As a STEM student, I have identified several problems with all the popular note taking apps: 
	- insufficient support with LaTeX
	- insufficient support for handwriting
	- insufficient support for plotting/graphing
For most of the popular, existing apps, support for LaTeX and support for handwriting is mutually exclusive. The only one on the market that is capable of doing all of elements listed above is OneNote. However, OneNote has several issues, most notably it uses its own equation editor instead of LaTeX. More importantly, OneNote only has its full power on Windows. The flow of note taking on OneNote is also not as simple as it could be, let alone its disastrous note-to-PDF conversion when it includes any amount of handwriting. 

Restructured Notes aims to combine Markdown with good handwriting support, which should provide enough flexibility for everyday note-taking purpose in a STEM class. 

# Run the app from source

```shell script
git clone https://github.com/mia1024/restructured-notes
cd restructured-notes
./setup_env
yarn dev
```

On Linux, the following packages need to be installed for all native modules to compile correctly:

```
build-essential clang libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev \
libkrb5-dev libdbus-1-dev libgtk-3-dev libnotify-dev libgnome-keyring-dev libasound2-dev \
libcap-dev libcups2-dev libxtst-dev libxss1 libnss3-dev gcc-multilib g++-multilib curl \
gperf bison python-dbusmock openjdk-8-jre libssl-dev libsqlite3-dev
```

It is important that you run the `setup_env` script instead of `yarn` or `npm install`, as a few dependencies 
need to be compiled on your machine for everything to work. It is safe to run `setup_env` more than once.

# Run test

```shell script
yarn test
```

# Features Roadmap 

There should be at least one commit per checkbox. After completion of each checkbox item, append the commit SHA. Each version should be tagged.

- v 0.0.1 (editor update)
	- Logic
		- [ ] OOP model for notebook fs representation
		- [ ] Git/VCS integration
		- [ ] database for tags 
		- [ ] ~~multi-instance editor lock~~
		- [ ] Hooks
	- UI
		- VCS
			- [ ] notebook/note creation dialog
			- [ ] on save summary (commit message) dialog
			- [ ] version revert page
		- Settings
			- [ ] global settings page
			- [ ] per notebook settings page
		- Navigation
			- [ ] URL scheme registration 
			- [ ] plain text editor for notes
			- [ ] Directory/notebook tree viewer
		- [x] Launcher icon (e37cd84)
		- [ ] ~~Dialog for detection warning~~
		- [ ] ~~i18n~~
	- Docs
		- [ ] fs model for a notebook
		- [ ] tag DB architectures
		- [ ] URL scheme
	- Unittest 
		- [ ] fs operations
		- [ ] tags 
		- [ ] UI navigation
		- [x] settings
		- [ ] URL scheme
- v 0.0.2
	- Logic 
		- [ ] in memory encryption/decryption (AES)
		- [ ] optional VCS exempt for encrypted notes
	- UI
		- [ ] create encrypted notes/notebooks
		- [ ] edit encrypted notes/notebooks
		- [ ] save encrypted notes
		- [ ] passphrase entry dialog (on save/attachment operation)
		- [ ] dialog for saving passphrase in memory
	- Docs
		- [ ] crypto UI
	- Unittest 
		- [ ] crypto operations
- v 0.0.3
	- Logic 
		- [ ] Markdown lexing
		- [ ] Markdown to HTML
		- [ ] Markdown to PDF
	- UI
		- [ ] Markdown preview (two columns)
		- [ ] real time preview rendering (no refresh)
		- [ ] rendering math in preview
		- [ ] syntax highlighting
		- [ ] switch between plaintext and markdown
		- [ ] editor fonts?
	- Docs
		- [ ] rendering API
	- Unittest
		- [ ] rendering
- v 0.0.4
	- Logic 
		- [ ] conversion between lexer trees from `marked` and `editorjs`
	- UI
		- [ ] toolbar for inserting various components
		- [ ] global settings for rebind shortcut
	- Docs
		- [ ] toolbar shortcut
	- Unittest
		- [ ] tree conversion
		- [ ] toolbar function
- v 0.0.5
	- Logic 
		- [ ] cross-notes linking
		- [ ] notebook to HTML with correct links
		- [ ] notebook to PDF with correct links
- v 0.0.6
	- Logic 
		- [ ] store attachments
		- [ ] store attachments encrypted
		- [ ] missing attachment file handling
	- UI
		- [ ] insert image
		- [ ] insert any attachment (open in fs)
	- Docs
		- [ ] image and attachment handling
	- Unittest
		- [ ] attachments
- v 0.0.7
	- Logic 
		- [ ] Search notes, tags, attachments
	- UI
		- [ ] Search page


- v 0.1.0 (whiteboard update)
	- Logic 
		- [ ] whiteboard serialization and deserialization
		- [ ] whiteboard to PNG 
		- [ ] whiteboard interface to main process communication with socket
		- [ ] register markdown token for whiteboard instance
	- UI
		- whiteboard (separate pop-up)
			- [ ] double click to edit
			- [ ] pen pressure
			- [ ] textbox
			- [ ] arrow
			- [ ] custom shape
			- [ ] math
	- Docs
		- [ ] whiteboard and its data format
	- Unittest
		- [ ] serialization and deserialization
- v 0.1.1
	- Logic 
		- [ ] launch LAN socket to remote whiteboard instance
		- [ ] upload whiteboard file
		- [ ] launch server and websocket for remote whiteboard, with optional self-signed certificate
		- [ ] firewall detection 
	- UI
		- [ ] whiteboard supports image upload
		- remote whiteboard
			- [ ] generate QR code for link
			- [ ] real time synchronization with service worker
			- [ ] electron `webview`
			- [ ] dialog for generate self-signed certificate 
			- [ ] hosting remote whiteboard on server for potential connection error
	- Docs
		- [ ] remote whiteboard instance
		- [ ] self-signed certificate
	- Unittest
		- [ ] websocket
		- [ ] whiteboard
- v 0.1.2
	- Logic 
	- UI
		- [ ] concept map for relations between notes
		- [ ] navigate between notes with concept map
- v 0.1.3
	- Logic
		- [ ] read PDF
	- UI
		- [ ] whiteboard supports loading and annotating PDF
- v 0.1.4
	- Logic 
		- [ ] whiteboard OCR
		- [ ] search within whiteboards
- v 1.0.0 
	- UI
		- [ ] checking for update
		- [ ] crash report (redirect to github)
	- [ ] gh sponsor
	- [ ] web page
	- [ ] Package and release!


# License

Copyright (C) 2020  Mia Celeste

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
