build:
	docker build -t tgbot .
run:
	docker run -d -p 3001:3001 --name tgbot --rm tgbot