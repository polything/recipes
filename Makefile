pack ::= "public.tgz"
src ::= "~/recipes"

clean:
	-rm -r ${pack} *.log tests_output

deploy: clean package upload server-restart

node_modules: package.json
	npm install

package:
	tar -czf ${pack} app.js auth js models package.json package-lock.json public routes views

serve: node_modules
	nodemon start

server-restart:
	-ssh recipes "cd ${src} && npm install"

test: node_modules
	npm test

upload: package
	-ssh recipes "cd ${src} && rm -r *"
	scp ${pack} recipes:${src}
	ssh recipes "cd ${src} && tar -xzf ${pack} && rm ${pack}"

.PHONY: clean deploy package serve server-restart test upload
