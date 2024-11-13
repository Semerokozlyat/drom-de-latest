
.PHONY: lint
lint:
	pnpm lint

.PHONY: run-frontend
run-frontend:
	pnpm run dev

.PHONY: build-frontend
build-frontend:
	pnpm run build