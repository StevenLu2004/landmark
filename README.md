# LANdmark

Simple LAN file sharing using Node.js

My hackathon project in HackPHS 2019

## Inspiration

In my high school, the internet connection speed is terribly slow, but the LAN connection is acceptable. This is the case for a lot of places, of OK LAN but poor Wi-fi coverage. Node.js allows a file server to be hosted on a PC/Mac/Linux machine. I have made a simple file server before, so when people all need to download some large files at the same time, they can download from my laptop at speeds higher than normal after I download it. I put installers of apps required by the school in that folder so that they can be easily accessible in my vicinity.

However, this is not enough. Not only did the old program support no more than file download, but the user would also actually have to remember and input a super-long tedious URL. This project is building another platform independent of the previous one to achieve higher capacity, allowing file directory browsing (with folder collapse), file download, file upload, and a file hub function called "peripheral" (in beta, explained later).

## What it does

### Download server – sharing is always welcome

- Hosts a server on port 3000 to serve dynamic contents from an internal directory in which the user can store his/her own files.
- Allows directory browsing with collapsible folders and file download links (two types, open in a new tab and direct download, for previewing files and download, respectively).
- Serves files from the internal directory, so that they can be downloaded by computers on the same LAN.

### Upload server – complementary file transfer in the other direction

- Allows single file uploads via an HTML form. (Multiple file uploads might be supported in the future.)
- Scans for potentially dangerous file types (executables, shell scripts, etc.), to protect the host from malicious uploads.
- Customizable blacklist using Regex, allow user-specific file-blocking (e.g. Putting `'f[u*][c*]?k'` in the blacklist will block off files with names containing "fuck" and all related acronyms).
- Separate upload folder from the download folder, allowing better privacy measures.

### Peripheral – WHAT THE HECK?

Peripheral is a feature that allows file uploads to bypass host inspection and directly be accessible by the public on the same LAN. Its primary goal is "one installation, multi-direction transfer" – that is to say, turning the host's computer into a file hub for *temporary* file storage and *limited* and *directed* sharing. I named it Peripheral because it goes around the filter and folder separation at the center.

With peripheral, once I launch my LANdmark, other people will be able to perform high-speed file sharing over the LAN through my machine, with the files deleted from the host after a certain delay or after a specific number of downloads (both specified, whichever occurs earlier). This would certainly lower the security measures by a limited amount, but the host will greatly help other people in the area to perform direct file sharing.

As a temporary file hub, all files in Peripheral will be deleted on relaunching the server.

Peripheral is currently under beta. At the time this sentence is composed, auto-delete is being developed.

## How I built it

Node.js server + HTML5/~~CSS~~/ES6 client

### Frameworks used

#### Major dependencies

- Express.js (server)
  - Multer (server, form file upload parser, works with Express.js)
- Vue.js (client)
- Socket.io (both, might come later)

#### Major dev-dependencies

- Webpack (packing scripts for client-side)

### Wanna hear the story?

I started off rebuilding a directory-browsing server (`src/server/index.js`, `src/server/explorer.js`) and webpage (`src/client/html/index.html`, `src/client/index.js`, `src/client/components.js`). I did the JSON directory tree first, and then the whole thing.

Then I added directory collapse and file download. I tested it out on a friend's computer. But I was serving a video and it opened in a new tab instead of being downloaded, so I added a second link – the first one for preview, the second one for actual download.

Next, I moved onto file upload. The client-side is easy: you basically just make a form send it. The server-side is a mess: I made many stupid mistakes, and there are limitations on the framework Multer. I linked the two webpages with hyperlinks after I finished.

By 3 a.m., I moved onto Peripheral. It basically inherits a lot of the stuff from the file explorer, downloader and uploader (because it needs to do all these, only probably not to such an extent). So there was a bunch of Cmd-C Cmd-V from one of my files to another, as well as continuous debugging to solve the compatibility issues and account for new features. By the time this sentence is composed, I'm adding socket.io communication to the program.

## Challenges I ran into

Debugging something within a framework was a frustrating experience. The codes are all wrapped up, so what you see in the console isn't what you've been working on, especially after running Webpack and a JS minifier. What's most important, it hides many apparent errors from you and makes you think that it's a problem with using the frameworks' APIs when you simply mistyped `{ files: [] }` as `{ files = [] }`.

Another notable challenge is to coordinate the crazy async-ness of Node.js, especially when you recursively call async methods in a normal `dirWalk`. Custom Events saved the day, eventually.

## Accomplishments that I'm proud of

- Finishing two features and getting the third into prototyping and beta. (Still working hard!)
- First time getting Webpack to work :s

## What I learned

- How to use Webpack
- How to resolve async-ness
- How to debug projects with extensive frameworks
- To prioritize functionality over style when time is limited
- Prototyping early and prototyping often

## What's next for LANdmark

### In the near future

Finish Peripheral

> That means socket.io integration for notifying file updates and another day of delightful miseries on the server-side

Add multi-file up/download

Add styles

### In the far future (unlikely)

Electron.js integration and app deployment

Wi-fi Direct integration

## GitHub repo

[Here](https://github.com/StevenLu2004/landmark)

## Installation and launching

Clone or download zip, `cd` into the project's root directory, and

```bash
npm install && npm run build && npm start
```

You might need `sudo`.

Now type `http://localhost:3000` in your browser's URL field.

## Contribute

- Download/clone and test it out, report bugs to issues
- Suggest new features in issues
- Fork, mod it and make PRs

<div style="text-align: center; font-family: 'Times New Roman'"><i>Be the Landmark of Your Life</i></div>
