# Build app
vue-install:
	yarn install

serve:
	serve -s dist -p 3000

start:
	yarn serve

test:
	yarn test

# Genera /dist con .env.production.local
build:
	yarn build


# Use node v16: Install: nvm install lts/gallium -> v16.18.1
node:
	nvm use 16