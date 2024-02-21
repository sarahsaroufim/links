// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement('script')
markdownIt.src = 'https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js'
document.head.appendChild(markdownIt)



// Okay, Are.na stuff!
let channelSlug = 'nirvaan' // The “slug” is just the end of the URL



// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (data) => {
	// Target some elements in your HTML:
	let channelTitle = document.getElementById('channel-title')
	let channelDescription = document.getElementById('channel-description')
	let channelCount = document.getElementById('channel-count')
	let channelLink = document.getElementById('channel-link')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = data.title
	channelDescription.innerHTML = window.markdownit().render(data.metadata.description) // Converts Markdown → HTML
	channelCount.innerHTML = data.length
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}



// Then our big function for specific-block-type rendering:
let renderBlock = (block) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.getElementById('channel-blocks')

	// channelBlocks.classList.add('circles');

	// Links!

	if (block.class == 'Link') {
		let linkItem =
			`
			<li class="circle">
				<!-- <p><em>Link</em></p> -->
				<picture>
					<source media="(max-width: 428px)" srcset="${ block.image.thumb.url }">
					<source media="(max-width: 640px)" srcset="${ block.image.large.url }">
					<img src="${ block.image.original.url }">
				</picture>
				<!-- <h3>${ block.title }</h3>
				${ block.description_html }
				<p><a href="${ block.source.url }">See the original ↗</a></p> -->
			</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', linkItem)
	}

	// Images!
	else if (block.class == 'Image') {
        let imageItem =
        `
            <li class="circle">
                <img src="${block.image.large.url}" alt="${block.title}" by "${block.user.fullname}">
                <!-- <figcaption>${block.title}</fig> -->
            </li>
        `
        channelBlocks.insertAdjacentHTML('beforeend', imageItem)
	}

	// Text!
	else if (block.class == 'Text') {
		let textItem =
			`
			<li class="circle">
				<blockquote>
				${block.content_html}
				</blockquote>
			</li>
			`
		channelBlocks.insertAdjacentHTML('beforeend', textItem)
	}

	// Uploaded (not linked) media…
	else if (block.class == 'Attachment') {
	let attachment = block.attachment.content_type // Save us some repetition

		// Uploaded videos!
		if (attachment.includes('video')) {
			// …still up to you, but we’ll give you the `video` element:
			let videoItem =
				`
				<li class="circle">
					<!-- <p><em>Video</em></p> -->
					<video controls src="${ block.attachment.url }"></video>
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', videoItem)
			// More on video, like the `autoplay` attribute:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
		}

        // Uploaded PDFs!
        else if (attachment.includes('pdf')) {
            let pdfItem =
            `
				<li class="circle">
                    <a href="${block.attachment.url}">
                        <figure>
                            <img src="${block.image.large.url}" alt="${block.title}">
                            <!-- <figcaption>${block.title}</figcaption> -->
                        </figure>
                    </a>
                </li>
            `
        channelBlocks.insertAdjacentHTML('beforeend', pdfItem);
        }

		// Uploaded audio!
		else if (attachment.includes('audio')) {
			// …still up to you, but here’s an `audio` element:
			let audioItem =
				`
				<li class="circle">
					<!-- <p><em>Audio</em></p> -->
					<audio controls src="${ block.attachment.url }"></video>
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', audioItem)
			// More on audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
		}
	}

	// Linked media…
	else if (block.class == 'Media') {
		let embed = block.embed.type

		// Linked video!
		if (embed.includes('video')) {
			// …still up to you, but here’s an example `iframe` element:
			let linkedVideoItem =
				`
				<li class="circle">
					<!-- <p><em>Linked Video</em></p> -->
					${ block.embed.html }
				</li>
				`
			channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem)
			// More on iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
		}

		// Linked audio!
		else if (embed.includes('rich')) {
			// …up to you!
		}
	}
}

// It‘s always good to credit your work:
let renderUser = (user, container) => { // You can have multiple arguments for a function!
	let userAddress =
		`
		<address>
			<h3>${ user.first_name }</h3>
			<p><a href="https://are.na/${ user.slug }">are.na profile</a></p>
		</address>
		`
	container.insertAdjacentHTML('beforeend', userAddress)
}

// Now that we have said what we can do, go get the data:
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, { cache: 'no-store' })
	.then((response) => response.json()) // Return it as JSON data
	.then((data) => { // Do stuff with the data
		console.log(data) // Always good to check your response!
		placeChannelInfo(data) // Pass the data to the first function

		// Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
		data.contents.reverse().forEach((block) => {
			console.log(block) // The data for a single block
			renderBlock(block) // Pass the single block data to the render function
		})

// random animation
document.querySelectorAll('.circle').forEach((circle) => {
    let randomDuration = 5;
    let maxX = window.innerWidth - circle.offsetWidth; // max x position
    let maxHeight = window.innerHeight - circle.offsetWidth; // max y position
    let randomX = Math.random() * maxX;
    let randomY = Math.random() * maxHeight;
    let speed = 3;
    let randomAngle = Math.random() * 5 * Math.PI;
    let randomMoveX = Math.cos(randomAngle) * speed;
    let randomMoveY = Math.sin(randomAngle) * speed;

    circle.style.setProperty('--random-duration', `${randomDuration}s`);
    circle.style.setProperty('--random-delay', `0s`);
    circle.style.setProperty('--random-x', `${randomX / window.innerWidth * 100}vw`);
    circle.style.setProperty('--random-y', `${randomY / window.innerHeight * 100}vh`);
    circle.style.setProperty('--random-move-x', `${randomMoveX}px`);
    circle.style.setProperty('--random-move-y', `${randomMoveY}px`);

    function updatePosition() {
        randomX += randomMoveX;
        randomY += randomMoveY;

        if (randomX < 0 || randomX > maxX) {
            randomMoveX *= -1; // reverse x direction
        }

     	if (randomY < 0 || randomY > maxHeight) {
            randomMoveY *= -1; // reverse y direction
        }

        circle.style.setProperty('--random-x', `${randomX / window.innerWidth * 100}vw`);
        circle.style.setProperty('--random-y', `${randomY / window.innerHeight * 100}vh`);
    }
	
    setInterval(updatePosition, 200); // update position every 5 secs
});


		// Also display the owner and collaborators:
		let channelUsers = document.getElementById('channel-users') // Show them together
		data.collaborators.forEach((collaborator) => renderUser(collaborator, channelUsers))
		renderUser(data.user, channelUsers)
	})