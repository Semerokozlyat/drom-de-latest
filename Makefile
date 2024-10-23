
.PHONY: lint-frontend
lint-frontend:
	cd ./drom-de && pnpm lint


.PHONY: run-frontend
run-frontend:
	cd ./drom-de && pnpm run dev

.PHONY: build-frontend
build-frontend:
	cd ./drom-de && pnpm run build