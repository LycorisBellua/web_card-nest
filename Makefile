#Compose Files
BASE_COMPOSE_FILE = ./containers/docker-compose.yml
FRONTEND_DEV_COMPOSE_FILE = ./containers/docker-compose.frontend_dev.yml
BACKEND_DEV_COMPOSE_FILE = ./containers/docker-compose.backend_dev.yml
PROD_COMPOSE_FILE = ./containers/docker-compose.prod.yml

#Environment / Certs
ENV_FILE = ./containers/.env
NGINX_CERTS_DIR = ./containers/nginx/certs

# Docker Commands
COMPOSE = docker compose
FRONTEND = -f $(BASE_COMPOSE_FILE) -f $(FRONTEND_DEV_COMPOSE_FILE)
BACKEND = -f $(BASE_COMPOSE_FILE) -f $(BACKEND_DEV_COMPOSE_FILE)
PROD = -f $(BASE_COMPOSE_FILE) -f $(PROD_COMPOSE_FILE)
UP = up --build -d
DOWN = down
RM = rm -rf

all: prod_up

env-file:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "POSTGRES_USER=db_user" > $(ENV_FILE); \
		echo "POSTGRES_PASSWORD=$$(openssl rand -base64 32)" >> $(ENV_FILE); \
		echo "POSTGRES_DB=transcendence" >> $(ENV_FILE); \
		echo "PGDATA=/var/lib/postgresql/data/pgdata" >> $(ENV_FILE); \
		echo "Generated .env file";\
	fi

certs:
	@if [ ! -f $(NGINX_CERTS_DIR)/cert.pem ]; then \
		mkdir -p $(NGINX_CERTS_DIR); \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
			-keyout $(NGINX_CERTS_DIR)/key.pem \
			-out $(NGINX_CERTS_DIR)/cert.pem \
			-subj "/CN=localhost"; \
		echo "Generated SSL certs"; \
	fi

frontend_up: down env-file
	$(COMPOSE) $(FRONTEND) $(UP)

backend_up: down env-file
	$(COMPOSE) $(BACKEND) $(UP)

prod_up: down env-file certs
	$(COMPOSE) $(PROD) $(UP)

down:
	@$(COMPOSE) $(FRONTEND) $(DOWN) 2>/dev/null || true
	@$(COMPOSE) $(BACKEND) $(DOWN) 2>/dev/null || true
	@$(COMPOSE) $(PROD) $(DOWN) 2>/dev/null || true
	@echo "All Containers removed"

clean: down
	@docker system prune -af
	@echo "All Images removed"

fclean: clean
	@docker volume rm transcendence_db-data
	@$(RM) $(ENV_FILE)
	@$(RM) $(NGINX_CERTS_DIR)
	@echo "Database Volume, Nginx SSL Certs and .env file removed"

re: fclean all

logs:
	@$(COMPOSE) $(FRONTEND) logs -f 2>/dev/null || \
	$(COMPOSE) $(BACKEND) logs -f 2>/dev/null || \
	$(COMPOSE) $(PROD) logs -f

.PHONY: all env-file frontend_up backend_up prod_up down clean fclean re logs