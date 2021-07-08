const root = {
    "id": "trivia",
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        },
        "rounds": {
            "type": "array",
            "items": {
                "oneOf": [
                    {"$ref": "trivia-round-category"},
                    {"$ref": "trivia-round-multiple-choice"}
                ]
            },
            "minItems": 1,
            "uniqueItems": true
        }
    },
    "required": ["name", "rounds"]
}

const category = {
    "id": "trivia-round-category",
    "properties": {
        "type": {
            "type": "string",
            "enum": ["categorical"]
        },
        "column": {
            "type": "array",
            "items": {
                "$ref": "trivia-category-column"
            },
            "minItems": 6,
            "maxItems": 6
        },
    },
    "required": ["type", "column"]
}

const column = {
    "id": "trivia-category-column",
    "properties": {
        "category": {"type": "string"},
        "cell": {
            "type": "array",
            "items": {
                "$ref": "trivia-category-cell"
            },
            "minItems": 5,
            "maxItems": 5
        }
    },
    "required": ["category", "cell"]
}

const cell = {
    "id": "trivia-category-cell",
    "properties": {
        "value": {"type" : "integer"},
        "type": {
            "type" : "string",
            "enum" : ["text"]
        },
        "q": {"type" : "string"},
        "a": {"type" : "string"}
    },
    "required": ["value", "type", "q", "a"]
}

const multipleChoice = {
    "id": "trivia-round-multiple-choice",
    "properties": {
        "type": {
            "type": "string",
            "enum": ["multiple-choice"]
        },
        "bonus": {"type": "integer"},
        "correct-answer": {"type": "integer"},
        "question" : {"type" : "string"},
        "options": {
            "type": "array",
            "items": {"type": "string"},
            "minItems": 5,
            "maxItems": 5
        },
    },
    "required": ["type", "bonus", "correct-answer", "options"]
}

export {root, multipleChoice, category, column, cell};