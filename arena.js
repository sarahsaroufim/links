// This allows us to process/render the descriptions, which are in Markdown!
// More about Markdown: https://en.wikipedia.org/wiki/Markdown
let markdownIt = document.createElement("script");
markdownIt.src =
  "https://cdn.jsdelivr.net/npm/markdown-it@14.0.0/dist/markdown-it.min.js";
document.head.appendChild(markdownIt);

// Okay, Are.na stuff!
let channelSlug = "nirvaan"; // The “slug” is just the end of the URL

// this holds all block data from are.na api
let blockdata = {};

// popup block titles
let popup = document.querySelector(".popup");
popup.style.display = "none"; // sets initial display to none
let popcontainer = document.querySelector(".popcontainer");
popcontainer.style.display = "none";

let windowPop = document.querySelector(".pop");
windowPop.style.display = "none";

function openWindowPop(circle) {
  const { title, description, link, image } = {
    title: circle.getAttribute("data-key"),
    description: circle.getAttribute("data-description"),
    link: `https://www.are.na/block/${circle.getAttribute("data-id")}`,
    image: circle.getAttribute("data-image"),
  };

  document.getElementById("title").innerHTML = title === null ? "" : title;
  document.getElementById("description").innerHTML =
    description === null ? "" : description;
  document.getElementById("link").href = link;

  if (image == "null") {
    document.getElementById("image").style.display = "none";
  } else {
    document.getElementById("image").style.display = "block";
    document.getElementById("image").src = image;
  }

  windowPop.style.display = "flex";
  popcontainer.style.display = "grid";
}

function closeWindowPop() {
  windowPop.style.display = "none";
  popcontainer.style.display = "none";
}

// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (data) => {
  // Target some elements in your HTML:
  let channelTitle = document.getElementById("channel-title");
  let channelDescription = document.getElementById("channel-description");
  let channelCount = document.getElementById("channel-count");
  let channelLink = document.getElementById("channel-link");

  // Then set their content/attributes to our data:
  channelTitle.innerHTML = data.title;
  channelDescription.innerHTML = window
    .markdownit()
    .render(data.metadata.description); // Converts Markdown → HTML
  channelCount.innerHTML = data.length;
  channelLink.href = `https://www.are.na/channel/${channelSlug}`;
};

// Then our big function for specific-block-type rendering:
let renderBlock = (block) => {
  // To start, a shared `ul` where we’ll insert all our blocks
  let channelBlocks = document.getElementById("channel-blocks");

  // Links!

  if (block.class == "Link") {
    let linkItem = `
			<li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
				<picture>
					<source media="(max-width: 428px)" srcset="${block.image.thumb.url}">
					<source media="(max-width: 640px)" srcset="${block.image.large.url}">
					<img src="${block.image.original.url}">
				</picture>
			</li>
			`;
    channelBlocks.insertAdjacentHTML("beforeend", linkItem);
  }

  // Images!
  else if (block.class == "Image") {
    let imageItem = `
            <li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
                <img src="${block.image.large.url}" alt="${block.title}" by "${block.user.fullname}">
            </li>
        `;
    channelBlocks.insertAdjacentHTML("beforeend", imageItem);
  }

  // Text!
  else if (block.class == "Text") {
    let textItem = `
			<li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
				<blockquote>
				${block.content_html}
				</blockquote>
			</li>
			`;
    channelBlocks.insertAdjacentHTML("beforeend", textItem);
  }

  // Uploaded (not linked) media…
  else if (block.class == "Attachment") {
    let attachment = block.attachment.content_type; // Save us some repetition

    // Uploaded videos!
    if (attachment.includes("video")) {
      // …still up to you, but we’ll give you the `video` element:
      let videoItem = `
				<li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
					<video controls src="${block.attachment.url}"></video>
				</li>
				`;
      channelBlocks.insertAdjacentHTML("beforeend", videoItem);
      // More on video, like the `autoplay` attribute:
      // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
    }

    // Uploaded PDFs!
    else if (attachment.includes("pdf")) {
      let pdfItem = `
				<li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
                    <a href="${block.attachment.url}">
                        <figure>
                            <img src="${block.image.large.url}" alt="${block.title}">
                        </figure>
                    </a>
                </li>
            	`;
      channelBlocks.insertAdjacentHTML("beforeend", pdfItem);
    }

    // Uploaded audio!
    else if (attachment.includes("audio")) {
      // …still up to you, but here’s an `audio` element:
      let audioItem = `
				<li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
					<audio controls src="${block.attachment.url}"></video>
				</li>
				`;
      channelBlocks.insertAdjacentHTML("beforeend", audioItem);
      // More on audio: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
    }
  }

  // Linked media…
  else if (block.class == "Media") {
    let embed = block.embed.type;

    // Linked video!
    if (embed.includes("video")) {
      // …still up to you, but here’s an example `iframe` element:
      let linkedVideoItem = `
				<li class="circle" data-key="${block.title}" data-id="${block.id}" data-image="${block.image ? block.image.display.url : null}" data-description="${block.description_html}">
					${block.embed.html}
				</li>
				`;
      channelBlocks.insertAdjacentHTML("beforeend", linkedVideoItem);
      // More on iframe: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
    }

    // Linked audio!
    else if (embed.includes("rich")) {
      // …up to you!
    }
  }
};

// It‘s always good to credit your work:
let renderUser = (user, container) => {
  // You can have multiple arguments for a function!
  let userAddress = `
		<address>
			<h3>${user.first_name}</h3>
			<p><a href="https://are.na/${user.slug}">are.na profile<span class="arrow"> ↗&#xFE0E;</span></a></p>
		</address>
		`;
  container.insertAdjacentHTML("beforeend", userAddress);
};
fetch(`https://api.are.na/v2/channels/${channelSlug}?per=100`, {
  cache: "no-store",
})
  .then((response) => response.json()) // Return it as JSON data
  .then((data) => {
    // Do stuff with the data
    console.log(data); // Always good to check your response!
    placeChannelInfo(data); // Pass the data to the first function

    // Loop through the `contents` array (list), backwards. Are.na returns them in reverse!
    data.contents
      .reverse()
      .slice(0, 40)
      .forEach((block) => {
        console.log(block); // The data for a single block
        blockdata[`${block.title}.${block.id}`] = block;
        renderBlock(block); // Pass the single block data to the render function
      });

// random animation
document.querySelectorAll(".circle").forEach((circle) => {

	// A variable that keeps track whether mouse of hovering over the circle.
	let hovering = false;

	circle.addEventListener("mouseover", () => {
	hovering = true;
	circle.classList.add("hovering"); // adds hovering class

	popup.innerText = circle.getAttribute("data-key");

	if (popup.innerText.length > 20) {
		popup.innerText = popup.innerText.slice(0, 20) + " ...";
	}

	popup.style.display = "block";

	popup.style.top = `${circle.offsetTop - 64 / 4}px`;
	popup.style.left = `${circle.offsetLeft - 64 / 4}px`;
	});

	circle.addEventListener("click", () => {
	openWindowPop(circle);
	});

	circle.addEventListener("mouseout", () => {
	hovering = false;
	// showTitleAt();
	circle.classList.remove("hovering"); // removes hovering class
	popup.style.display = "none";
	});

	let randomDuration = 5;
	let maxX = window.innerWidth - circle.offsetWidth; // max x position
	let maxHeight = window.innerHeight - circle.offsetHeight; // max y position
	let randomX = Math.random() * maxX;
	let randomY = Math.random() * maxHeight;
	let speed = 1.5;
	let randomAngle = Math.random() * 5 * Math.PI;
	let randomMoveX = Math.cos(randomAngle) * speed;
	let randomMoveY = Math.sin(randomAngle) * speed;

	circle.style.setProperty("--random-duration", `${randomDuration}s`);
	circle.style.setProperty("--random-delay", `0s`);
	circle.style.setProperty(
	"--random-x",
	`${(randomX / window.innerWidth) * 100}vw`
	);
	circle.style.setProperty(
	"--random-y",
	`${(randomY / window.innerHeight) * 100}vh`
	);
	circle.style.setProperty("--random-move-x", `${randomMoveX}px`);
	circle.style.setProperty("--random-move-y", `${randomMoveY}px`);

	function updatePosition() {
	if (!animationPaused && !hovering) {
		randomX += randomMoveX;
		randomY += randomMoveY;
		if (randomX < 0 || randomX > maxX) {
		randomMoveX *= -1; // reverse x direction
		}

		if (randomY < 0 || randomY > maxHeight) {
		randomMoveY *= -1; // reverse y direction
		}

		circle.style.setProperty(
		"--random-x",
		`${(randomX / window.innerWidth) * 100}vw`
		);
		circle.style.setProperty(
		"--random-y",
		`${(randomY / window.innerHeight) * 100}vh`
		);
	}
	}

	setInterval(updatePosition, 200); // update position every 5 secs
});

// Also display the owner and collaborators:
let channelUsers = document.getElementById("channel-users"); // Show them together
data.collaborators.forEach((collaborator) =>
	renderUser(collaborator, channelUsers)
	);
	renderUser(data.user, channelUsers);
	});

// variable that tracks animation state
let animationPaused = false;

// toggle animation state
function toggleAnimation() {
animationPaused = !animationPaused;
const toggleButton = document.querySelector('.toggle');
if (animationPaused) {
	toggleButton.textContent = "un-freeze time";
	toggleButton.classList.add('active');
} else {
	toggleButton.textContent = "freeze time";
	toggleButton.classList.remove('active');
}
}