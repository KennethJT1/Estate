"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const config_1 = require("./config");
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./routes/auth"));
const ad_1 = __importDefault(require("./routes/ad"));
const app = (0, express_1.default)();
mongoose_1.default.set("strictQuery", false);
mongoose_1.default
    .connect(config_1.DATABASE)
    .then(() => console.log("Database connected"))
    .catch((err) => console.error(err));
app.use(express_1.default.json({ limit: "10mb" }));
app.use((0, morgan_1.default)("dev"));
app.use((0, cors_1.default)());
app.use("/", auth_1.default);
app.use("/", ad_1.default);
const port = process.env.PORT || 3166;
app.listen(port, () => console.log(`Estate server listening on http://localhost:${port}`));
