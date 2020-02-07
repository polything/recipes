pack ::= "recipe-image.tgz"
src ::= "~/recipes/src"

build: Dockerfile
	docker build -t recipes .

clean:
	-rm -r ${pack} *.log tests_output node_modules

deploy: clean build package upload server-restart

node_modules: package.json
	npm install

package:
	docker save -o ${pack} recipes

serve:
	docker-compose up -d

serve-down:
	docker-compose down

serve-log:
	-docker-compose logs -f

server-restart:
	ssh recipes "cd ${src} && docker-compose restart"

test: node_modules
	npm test

upload: package
	-ssh recipes "cd ${src} && rm -r *"
	rsync -vc ${pack} recipes:${src}
	rsync -vc docker-compose.yml recipes:${src}
	ssh recipes "cd ${src} && docker load -i ${pack} && rm ${pack}"

.PHONY: build clean deploy package serve serve-down serve-log server-restart test upload
