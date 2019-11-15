goto_src=cd ~/recipes/$(env)
git_update=git fetch origin $(env) && git checkout $(env) && git reset --hard FETCH_HEAD

logs: #type=error|access
	ssh recipes "${goto_src} && tail -f ./log${type}.log"

server-update: #env=prod
	@make title text="Fetching prod branch and updating src"
	ssh recipes "${goto_src} && ${git_update}"
	ssh recipes "${goto_src} && npm i"

server-reload: #env=prod
	@make title text="Rebuilding server"
	ssh recipes "${goto_src}"

start:
	@make title text="Starting server"
	nodemon start

title:
	@echo "\033[92m>>> $(text)\033[0m"

