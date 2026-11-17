# Accessibility Enhancer

A Chrome extension that uses an LLM to make web pages easier to use with a screen reader.

It does two things.

The first is describing images. Turn on image mode and click any image on a page. The extension sends it to a backend, reads the description aloud, and copies it to your clipboard. There is a second mode that reads the text inside an image instead of describing it.

The second is fixing page structure. One button sends the page's HTML to the backend, which uses Gemini to rewrite it with proper semantic tags. The extension swaps the new HTML in and tells you how many tags it updated.

Each step is also spoken through the browser's speech synthesis, so you get feedback without looking at the screen.

## How it works

`content.js` runs on every page and handles the clicks, the speech and the HTML swap. `popup.js` is the small settings menu. The LLM calls happen on a separate backend that is not in this repo, and the address in the code points at a server that is no longer running.

## Install

1. Download or clone this repo.
2. Open `chrome://extensions` and turn on Developer mode.
3. Click "Load unpacked" and pick this folder.

The extension loads without the backend, but image descriptions and tag fixes need one.
