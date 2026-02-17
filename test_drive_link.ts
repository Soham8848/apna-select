
import { convertDriveLink } from "./lib/utils";

const testCases = [
    "https://drive.google.com/file/d/1ABC-XYZ/view",
    "https://drive.google.com/file/d/1ABC-XYZ/view?usp=sharing",
    "https://example.com/image.png",
    "not a url"
];

testCases.forEach(url => {
    console.log(`Input: ${url}`);
    console.log(`Output: ${convertDriveLink(url)}`);
    console.log('---');
});
