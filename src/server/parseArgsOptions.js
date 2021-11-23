export default {
    flags: [
        {
            long: "help",
            short: "h",
            boolean: "true",
        },
        {
            long: "render",
            short: "r",
            boolean: "true",
        },
        {
            long: "jit",
            short: "j",
            boolean: "true",
        },
        {
            long: "browserify",
            short: "b",
            boolean: "true",
        },
        {
            long: "interactive",
            short: "i",
            boolean: "true",
        },
        {
            long: "verbose",
            short: "v",
            default: false,
            boolean: "true",
        },        
    ],
};
