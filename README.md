# Description

- functions
	- markdown support - editor sync
	- rst support - editor sync
	- inline math?
	- PDF import/export support
	- Stylus support
	- plotting
	- concept map/flowchart (link to notes)
	- jupyter notebook integration??? maybe this is too much
	- Webcam support/airdrop style photo input from a phone
- organization levels
- sharing
- encrypted notes (AES-256-CBC)
- zen mode?
- git integration: a notebook is a git repo, for version control
- Packages
	- fabric js
	- tesseractjs
	- electron
	- editor js
	- monaco editor for inline code blocks
	    - potentially pop up window for easier implementation
	- marked js

# Roadmap

There should be at least one commit per checkbox. After completion of each checkbox item, append the commit SHA. Each version should be tagged.

- v 0.0.1 (editor update)
	- Logic
		- [ ] OOP model for notebook fs representation
		- [ ] Git/VCS integration
		- [ ] database for tags (MongoDB)
		- [ ] multi-instance editor lock
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
		- [ ] Dialog for detection warning
		- [ ] i18n
	- Docs
		- [ ] fs model for a notebook
		- [ ] tag DB architectures
		- [ ] URL scheme
	- Unittest 
		- [ ] fs operations
		- [ ] tags 
		- [ ] UI navigation
		- [ ] settings
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

# Run app

```bash
git clone https://github.com/mia1024/restructured-notes
cd restructured-notes
yarn 
yarn dev
```

If you get any DLL error, you may need to run `yarn compile-dependencies` before running `yarn dev`

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
