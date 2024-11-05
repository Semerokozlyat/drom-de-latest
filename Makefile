
.PHONY: lint-frontend
lint-frontend:
	pnpm lint


.PHONY: run-frontend
run-frontend:
	pnpm run dev

.PHONY: build-frontend
build-frontend:
	pnpm run build