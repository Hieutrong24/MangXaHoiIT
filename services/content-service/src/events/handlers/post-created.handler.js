import rabbitmq from "../config/rabbitmq.js";

export const handlePostCreated = async () => {
  await rabbitmq.consume("post.created", async (data) => {
    console.log("📢 Post created:", data);
  });
};
