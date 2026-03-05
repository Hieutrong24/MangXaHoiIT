function createPostService({ postRepository, postCreatedPublisher }) {
  return {
    async createPost({ authorId, title, content, tags, isPublic }, traceId) {
      if (!authorId) throw new Error("authorId required");
      if (!title || !title.trim()) throw new Error("title required");
      if (!content || !content.trim()) throw new Error("content required");

      const post = await postRepository.create({
        authorId: String(authorId),
        title: title.trim(),
        content,
        tags: Array.isArray(tags) ? tags : [],
        isPublic: isPublic !== false
      });

      // publish event
      await postCreatedPublisher.publish({ post, traceId });

      return post;
    },

    async getPost(id) {
      const post = await postRepository.getById(id);
      if (!post) return null;
      return post;
    },

    async listPosts(query) {
      return postRepository.list(query);
    },

    async deletePost(id) {
      return postRepository.remove(id);
    },
  };
}

module.exports = { createPostService };
