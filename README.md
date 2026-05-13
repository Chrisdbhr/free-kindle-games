# Free Kindle Games - Null Comma

A collection of classic games optimized for Amazon Kindle's experimental browser and E-Ink displays.

**Play now:** [nullcomma.com](https://nullcomma.com)

## Games

![Kindle Games Screenshot](https://cms.nullcomma.com/assets/1ac06e77-ea18-4d10-b8cb-eb155c4c7f97?format=webp&width=1200&height=400)

| | | |
|:---:|:---:|:---:|
| [![Tic-Tac-Toe](img/thumb_tictactoe.png)](games/tictactoe.html) <br> **Tic-Tac-Toe** | [![Memory Game](img/thumb_memory.png)](games/memory.html) <br> **Memory Game** | [![Sudoku](img/thumb_sudoku.png)](games/sudoku.html) <br> **Sudoku** |
| [![Battleship](img/thumb_battleship.png)](games/battleship.html) <br> **Battleship** | [![Word Search](img/thumb_wordsearch.png)](games/wordsearch.html) <br> **Word Search** | [![Hangman](img/thumb_hangman.png)](games/hangman.html) <br> **Hangman** |
| [![Connect 4](img/thumb_connect4.png)](games/connect4.html) <br> **Connect 4** | [![Dots and Boxes](img/thumb_dots.png)](games/dots.html) <br> **Dots and Boxes** | [Sinister Occurrences](games/sinister.html) <br> **Sinister Occurrences** |
| [![Crosswords](img/thumb_crosswords.png)](dev/crosswords.html) <br> **Crosswords** | | |

## Features

- **E-Ink Optimized**: High contrast, minimal animations, ghosting mitigation.
- **ES5 Compatible**: Works on old Kindle browsers without modern JS.
- **Offline**: HTML5 AppCache for play without Wi-Fi.
- **Multilingual**: Portuguese, English, Spanish, French, German.
- **AI Opponents**: Tic-Tac-Toe, Battleship, Connect 4, Dots and Boxes, Sinister Occurrences.
- **Multiplayer**: Pass-and-play in Battleship, Connect 4, Dots and Boxes (2-4 players), Sinister Occurrences (group mystery solving).

## Sinister Occurrences

A Black Stories-style mystery game with 20 stories (10 light, 10 dark). One player reads the situation, others ask yes/no questions to solve the mystery. Built-in timer tracks solve time.

## Installation

1. Clone this repository.
2. Deploy to a static file server (Nginx, GitHub Pages, etc.).
3. Access `index.html` from your Kindle's web browser.

## Tech Stack

- HTML5 / CSS3 (Legacy WebKit)
- Vanilla JavaScript (ES5)
- App Cache (Offline manifest)

## Guidelines

See [GUIDELINES.md](GUIDELINES.md) for technical constraints and implementation details.

## License

MIT License. See [LICENSE](.github/LICENSE).
