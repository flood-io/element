"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_protocol_1 = require("influx/lib/line-protocol");
const dgram_1 = require("dgram");
const zlib = require("zlib");
const ReporterAPI_1 = require("@flood/element/ReporterAPI");
const expect_1 = require("@flood/element/expect");
const debug_1 = require("debug");
const debug = debug_1.default('element:grid:reporter');
function encodeTraceData(traceData) {
    let compressedData = zlib.gzipSync(new Buffer(JSON.stringify(traceData), 'utf8'));
    return compressedData.toString('base64');
}
exports.encodeTraceData = encodeTraceData;
function decodeTraceData(traceData) {
    return JSON.parse(zlib.unzipSync(new Buffer(traceData, 'base64')).toString('utf8'));
}
exports.decodeTraceData = decodeTraceData;
class InfluxReporter {
    constructor(options, logger) {
        this.options = options;
        this.logger = logger;
        this.responseCode = '200';
        this.measurements = {};
        this.createSocket();
    }
    createSocket() {
        this.socket = dgram_1.createSocket('udp4');
    }
    newPoint(measurement, label) {
        return {
            measurement,
            tags: Object.assign({}, this.options.metricIdentifier.influxTags, { label: encodeURIComponent(label) }),
            fields: { response_code: this.responseCode },
        };
    }
    async send(point) {
        const payload = line_protocol_1.serializePoint(point);
        debug(payload);
        // if (measurement === 'trace') {
        // 	console.log(`REPORTER.send() ${JSON.stringify(payload, null, 2)}`)
        // }
        let message = Buffer.from(payload);
        await new Promise((yeah, nah) => {
            this.socket.send(message, Number(this.options.influxPort), this.options.influxHost, (err, bytes) => {
                if (err) {
                    debug(`ERROR: REPORTER.socket.send() ERROR: ${err.message}`);
                }
                else {
                    debug(`REPORTER.socket.send() wrote ${bytes} bytes`);
                }
                yeah();
            });
        });
    }
    close() {
        return this.socket.close();
    }
    reset(stepName) {
        this.stepName = stepName;
        this.responseCode = '200';
        this.measurements = {};
    }
    addTrace(traceData, label) {
        if (!traceData.objects)
            traceData.objects = [];
        let base64EncodedData = encodeTraceData(traceData);
        this.addMeasurement('object', base64EncodedData, label);
    }
    addMeasurement(measurement, value, label) {
        label = expect_1.expect(label || this.stepName, `Label must be present when writing measurement: ${measurement}`);
        if (!this.measurements[measurement])
            this.measurements[measurement] = [];
        this.measurements[measurement].push({ value, label });
    }
    addCompoundMeasurement(measurement, value, label) {
        label = expect_1.expect(label || this.stepName, `Label must be present when writing compound measurement: ${measurement}`);
        if (!this.measurements[measurement])
            this.measurements[measurement] = [];
        this.measurements[measurement].push({ value, label });
    }
    async flushMeasurements() {
        let sends = [];
        let printedResults = [];
        for (const [measurement, values] of Object.entries(this.measurements)) {
            if (!['trace', 'object'].includes(measurement)) {
                printedResults.push(`${measurement}: [${this.measurements[measurement]
                    .map(m => JSON.stringify(m.value))
                    .join(', ')}]`);
            }
            values.forEach((reading, index) => {
                const point = this.newPoint(measurement, reading.label);
                if (typeof reading.value === 'string' || typeof reading.value === 'number') {
                    point.fields['value'] = reading.value;
                }
                else {
                    Object.keys(reading.value).forEach(key => (point.fields[key] = reading.value[key]));
                }
                sends.push(this.send(point));
            });
        }
        this.logger.debug(`> ${printedResults.join(`, `)}`);
        await Promise.all(sends);
        this.reset();
    }
    testLifecycle(stage, label) {
        // this.logger.debug(`lifecycle: stage: ${stage} label: ${label}`)
        switch (stage) {
            case ReporterAPI_1.TestEvent.AfterStepAction:
                this.logger.info(`---> ${label}()`);
                break;
            case ReporterAPI_1.TestEvent.BeforeStep:
                this.logger.info(`===> Step '${label}'`);
                break;
            case ReporterAPI_1.TestEvent.AfterStep:
                this.logger.info(`---> Step '${label}' finished`);
                break;
            case ReporterAPI_1.TestEvent.StepSkipped:
                this.logger.info(`---- Step '${label}'`);
                break;
        }
    }
    testScriptError(message, error) {
        this.logger.error(`=!=> ${message} in ${this.stepName}: ${error.name}: ${error.message}`);
        error.unmappedStack.forEach(line => this.logger.error(`    ${line}`));
    }
    testStepError(error) {
        this.testScriptError('Failure', error);
    }
    testInternalError(message, error) {
        this.logger.error(`=!=> Internal ${message} error in ${this.stepName}`, error.message);
    }
    testAssertionError(error) {
        this.testScriptError('Assertion failure', error);
    }
    testScriptConsole(method, message, ...optionalParams) {
        console[method](message, ...optionalParams);
    }
}
exports.default = InfluxReporter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW5mbHV4UmVwb3J0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvSW5mbHV4UmVwb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSw0REFBeUQ7QUFDekQsaUNBQTRDO0FBQzVDLDZCQUE0QjtBQUk1Qiw0REFNbUM7QUFHbkMsa0RBQThDO0FBRTlDLGlDQUFnQztBQUNoQyxNQUFNLEtBQUssR0FBRyxlQUFZLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtBQWVuRCx5QkFBZ0MsU0FBUztJQUN4QyxJQUFJLGNBQWMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQTtJQUNqRixPQUFPLGNBQWMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUE7QUFDekMsQ0FBQztBQUhELDBDQUdDO0FBQ0QseUJBQWdDLFNBQVM7SUFDeEMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxNQUFNLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7QUFDcEYsQ0FBQztBQUZELDBDQUVDO0FBRUQ7SUFPQyxZQUFvQixPQUE4QixFQUFVLE1BQWM7UUFBdEQsWUFBTyxHQUFQLE9BQU8sQ0FBdUI7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBTm5FLGlCQUFZLEdBQVcsS0FBSyxDQUFBO1FBSTNCLGlCQUFZLEdBQWlCLEVBQUUsQ0FBQTtRQUd0QyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7SUFDcEIsQ0FBQztJQUVPLFlBQVk7UUFDbkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxvQkFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ25DLENBQUM7SUFFTyxRQUFRLENBQUMsV0FBbUIsRUFBRSxLQUFhO1FBQ2xE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