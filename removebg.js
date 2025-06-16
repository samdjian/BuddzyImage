import Replicate from 'replicate';
import { writeFile } from "fs/promises";
import { readFile } from "node:fs/promises";

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

async function removeBackground() {
    // const image = 'https://i0.wp.com/magicfabricblog.com/wp-content/uploads/2020/02/steampunk-fashion-e1724398678161.png';
    const image = await readFile("./tmp_assets/avatar (5).png");

    const output = await replicate.run(
        "lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1",
        {
            input: { image }
        }
    );
    return output;
}

const output = await removeBackground();
await writeFile("outputs/no_bg.png", output);
