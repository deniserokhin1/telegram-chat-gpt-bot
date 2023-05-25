build:
	docker build -t tgptbot .
run:
	docker run -d -p 3000:3000 --name tgptbot --rm tgptbot