# Database log reader

## Setup
Install the dependencies
```bash
npm install
```

Create a `.env` file with yor database config
```bash
cp .env.example .env
vim .env // or whatever editor you prefer
```

## Running
On linux/OSX
```bash
./dblog-reader

# or using a file as input
./dblog-reader < ./examples/input.txt
```

On windows
```bash
node ./src/index.js
```
