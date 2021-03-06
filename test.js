import test from 'ava';
import execa from 'execa';
import createTestServer from 'create-test-server';
import fileType from 'file-type';

test('main', async t => {
	const server = await createTestServer();

	server.get('/', (request, response) => {
		response.end('<body>Unicorn</body>');
	});

	const {stdout} = await execa('./cli.js', [server.url], {encoding: 'buffer'});

	t.is(fileType(stdout).mime, 'image/png');

	await server.close();
});

test('check flags', async t => {
	// Copied from `cli.js`
	let flags = `
--width=1000
--height=600
--type=jpeg.
--quality=0.5
--scale-factor=3
--emulate-device="iPhone X"
--timeout=80
--delay=10
--wait-for-element="#header"
--element=".main-content"
--hide-elements=".sidebar"
--remove-elements="img.ad"
--module=https://sindresorhus.com/remote-file.js
--module=local-file.js
--module="document.body.style.backgroundColor = 'red'"
--header="x-powered-by: capture-website-cli"
--user-agent="I love unicorns"
--cookie="id=unicorn; Expires=Wed, 21 Oct 2018 07:28:00 GMT;"
--authentication="username:password"
	`;

	flags = flags.trim().replace(/"/g, '').split('\n');

	const {stdout} = await execa('./cli.js', ['--internal-print-flags', ...flags]);
	const json = JSON.parse(stdout);

	// Remove dynamic content that cannot be snapshotted
	delete json.cookies[0].creation;

	t.snapshot(json);
});
