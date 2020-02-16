pack ::= "recipe-image.tgz"
src ::= "~/recipes/src"

build: Dockerfile clean build-dist
	docker build -t recipes .

build-dist:
	npm i webpack
	npx webpack
	cp -r src/public/css/* dist/
	cp node_modules/bootstrap/dist/css/bootstrap.min.css dist/
	rm -r node_modules

clean:
	-rm -r ${pack} *.log dist node_modules tests_output

deploy: clean build package upload server-restart

node_modules: package.json
	npm install

package:
	docker save -o ${pack} recipes

serve: clean
	docker-compose up -d

serve-down:
	docker-compose down

serve-log:
	-docker-compose logs -f

server-restart:
	ssh recipes "cd ${src} && docker-compose restart"

test: build serve
	npm test

upload: package
	-ssh recipes "cd ${src} && rm -r *"
	rsync -vc ${pack} recipes:${src}
	rsync -vc docker-compose.yml recipes:${src}
	ssh recipes "cd ${src} && docker load -i ${pack} && rm ${pack}"

.PHONY: build build-dist clean deploy package serve serve-down serve-log server-restart test upload
