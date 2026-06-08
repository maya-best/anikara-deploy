module.exports = function (eleventyConfig) {
  // --- Passthrough copy: deploy these untouched ---
  eleventyConfig.addPassthroughCopy({ "src/begin.html": "begin.html" });
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/pre-sleep": "pre-sleep" });
  eleventyConfig.addPassthroughCopy({ "src/morning-orientation": "morning-orientation" });
  // Any static assets dropped at the src root (images, icons, favicons, og images)
  eleventyConfig.addPassthroughCopy("src/*.png");
  eleventyConfig.addPassthroughCopy("src/*.jpg");
  eleventyConfig.addPassthroughCopy("src/*.svg");
  eleventyConfig.addPassthroughCopy("src/*.ico");
  eleventyConfig.addPassthroughCopy("src/assets");

  // --- Corpus collection (reverse chronological) ---
  eleventyConfig.addCollection("corpus", (collectionApi) => {
    return collectionApi.getFilteredByTag("corpus").sort((a, b) => b.date - a.date);
  });

  // --- Date filters ---
  eleventyConfig.addFilter("readableDate", (value) => {
    const d = new Date(value);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  });

  eleventyConfig.addFilter("isoDate", (value) => {
    return new Date(value).toISOString();
  });

  // --- One-line excerpt: description, else first stripped sentence of content ---
  eleventyConfig.addFilter("excerpt", (post) => {
    if (post.data && post.data.description) return post.data.description;
    const raw = (post.templateContent || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return raw.length > 160 ? raw.slice(0, 157).trimEnd() + "…" : raw;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md"],
  };
};
