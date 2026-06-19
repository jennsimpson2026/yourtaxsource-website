
import { getUploadUrl } from "./src/actions/documents";

async function test() {
  try {
    const result = await getUploadUrl("test.pdf", "application/pdf", "SUPPORTING");
    console.log("Result:", result);
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}

test();
