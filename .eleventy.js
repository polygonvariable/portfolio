function addCollection(eleventyConfig, collectionName, collectionPath) {
    eleventyConfig.addCollection(collectionName, function (collectionApi) {
        return collectionApi
            .getFilteredByGlob(collectionPath)
            .sort((a, b) => b.date - a.date);
    });
}

module.exports = function (eleventyConfig) {
    const isProduction = process.env.ELEVENTY_ENV === "production";

    eleventyConfig.addPassthroughCopy("src/asset");

    let collections = {
        "unrealBlog": "./src/blog/unreal/*.njk",
        "blenderBlog": "./src/blog/blender/*.njk",
        "artBlog": "./src/art/2026/*.njk",
        
        "art2026": "./src/art/2026/*.njk",
        "art2025": "./src/art/2025/*.njk",
        "art2024": "./src/art/2024/*.njk",
        "art2023": "./src/art/2023/*.njk",
        "art2022": "./src/art/2022/*.njk",

        "unrealProject": "./src/project/unreal/*.njk",
        "blenderProject": "./src/project/blender/*.njk",
        "webProject": "./src/project/web/*.njk",
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
        pathPrefix: isProduction ? "/portfolio/" : "/",
        dir: {
            input: "src",
            includes: "_includes",
            output: "_site",
        },
    };
};