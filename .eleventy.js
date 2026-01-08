function addCollection(eleventyConfig, collectionName, collectionPath) {
    eleventyConfig.addCollection(collectionName, function (collectionApi) {
        return collectionApi
            .getFilteredByGlob(collectionPath)
            .sort((a, b) => b.date - a.date);
    });
}

module.exports = function (eleventyConfig) {
    eleventyConfig.addPassthroughCopy("src/style");

    let collections = {
        "unrealBlog": "./src/blog/unreal/*.njk",
        "blenderBlog": "./src/blog/blender/*.njk",
        "unrealProject": "./src/project/unreal/*.njk",
        "blenderProject": "./src/project/blender/*.njk",
        "webProject": "./src/project/web/*.njk"
    }
    
    for (let collectionName in collections) {
        addCollection(eleventyConfig, collectionName, collections[collectionName]);
    }

    eleventyConfig.addFilter("shortDate", (dateObj) => {
        return new Intl.DateTimeFormat("en-IN", {
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(dateObj);
    });

    return {
        pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site",
        },
    };
};