"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InfluxReporter_1 = require("./InfluxReporter");
const Environment_1 = require("./Environment");
const winston_1 = require("winston");
async function main() {
    const gridConfig = initConfig();
    const influxReporter = initInfluxReporter(gridConfig);
    console.log(influxReporter);
    // new Loader()
}
exports.main = main;
function initConfig() {
    const gridConfig = Environment_1.initFromEnvironment();
    gridConfig.logger = winston_1.createLogger();
    const completeGridConfig = gridConfig;
    return completeGridConfig;
}
function initInfluxReporter(gridConfig) {
    return new InfluxReporter_1.default({
        influxHost: gridConfig.sumpHost,
        influxPort: gridConfig.sumpPort,
        metricIdentifier: gridConfig.metricIdentifier,
    }, gridConfig.logger);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR3JpZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9HcmlkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEscURBQTZDO0FBQzdDLCtDQUFtRDtBQUNuRCxxQ0FBOEM7QUFnQnZDLEtBQUs7SUFDWCxNQUFNLFVBQVUsR0FBRyxVQUFVLEVBQUUsQ0FBQTtJQUUvQixNQUFNLGNBQWMsR0FBRyxrQkFBa0IsQ0FBQyxVQUFVLENBQUMsQ0FBQTtJQUVyRCxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFBO0lBRTNCLGVBQWU7QUFDaEIsQ0FBQztBQVJELG9CQVFDO0FBRUQ7SUFDQyxNQUFNLFVBQVUsR0FBd0IsaUNBQW1CLEVBQUUsQ0FBQTtJQUM3RCxVQUFVLENBQUMsTUFBTSxHQUFHLHNCQUFZLEVBQUUsQ0FBQTtJQUVsQyxNQUFNLGtCQUFrQixHQUFlLFVBQXdCLENBQUE7SUFFL0QsT0FBTyxrQkFBa0IsQ0FBQTtBQUMxQixDQUFDO0FBRUQsNEJBQTRCLFVBQXNCO0lBQ2pELE9BQU8sSUFBSSx3QkFBYyxDQUN4QjtRQUNDLFVBQVUsRUFBRSxVQUFVLENBQUMsUUFBUTtRQUMvQixVQUFVLEVBQUUsVUFBVSxDQUFDLFFBQVE7UUFDL0IsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLGdCQUFnQjtLQUM3QyxFQUNELFVBQVUsQ0FBQyxNQUFNLENBQ2pCLENBQUE7QUFDRixDQUFDIn0=