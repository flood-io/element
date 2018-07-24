"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function newMetricIdentifierFromObject(obj) {
    return new MetricIdentifier(obj.accountID, obj.floodID, obj.gridID, obj.nodeID, obj.projectID, obj.region);
}
exports.newMetricIdentifierFromObject = newMetricIdentifierFromObject;
class MetricIdentifier {
    constructor(accountID, floodID, gridID, nodeID, projectID, region) {
        this.accountID = accountID;
        this.floodID = floodID;
        this.gridID = gridID;
        this.nodeID = nodeID;
        this.projectID = projectID;
        this.region = region;
    }
    isValid() {
        // Number.isNaN()
        return true;
    }
    get influxTags() {
        if (!this._influxTags) {
            this._influxTags = this.asInfluxTags();
        }
        return this._influxTags;
    }
    asInfluxTags() {
        let tags = {};
        const pairs = [
            ['account', this.accountID],
            ['flood', this.floodID],
            ['account', this.accountID],
            ['project', this.projectID],
            ['grid', this.gridID],
            ['node', this.nodeID],
            ['region', this.region],
        ];
        pairs.forEach(([key, value]) => {
            if (typeof value === 'string') {
                tags[key] = value;
            }
            else if (typeof value === 'number' && !Number.isNaN(value)) {
                tags[key] = String(value);
            }
        });
        return tags;
    }
}
exports.default = MetricIdentifier;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWV0cmljSWRlbnRpZmllci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9NZXRyaWNJZGVudGlmaWVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQThDLEdBQVE7SUFDckQsT0FBTyxJQUFJLGdCQUFnQixDQUMxQixHQUFHLENBQUMsU0FBUyxFQUNiLEdBQUcsQ0FBQyxPQUFPLEVBQ1gsR0FBRyxDQUFDLE1BQU0sRUFDVixHQUFHLENBQUMsTUFBTSxFQUNWLEdBQUcsQ0FBQyxTQUFTLEVBQ2IsR0FBRyxDQUFDLE1BQU0sQ0FDVixDQUFBO0FBQ0YsQ0FBQztBQVRELHNFQVNDO0FBRUQ7SUFDQyxZQUNRLFNBQWlCLEVBQ2pCLE9BQWUsRUFDZixNQUFjLEVBQ2QsTUFBYyxFQUNkLFNBQWlCLEVBQ2pCLE1BQWM7UUFMZCxjQUFTLEdBQVQsU0FBUyxDQUFRO1FBQ2pCLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDZixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBQ2QsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUNkLGNBQVMsR0FBVCxTQUFTLENBQVE7UUFDakIsV0FBTSxHQUFOLE1BQU0sQ0FBUTtJQUNuQixDQUFDO0lBRUosT0FBTztRQUNOLGlCQUFpQjtRQUNqQixPQUFPLElBQUksQ0FBQTtJQUNaLENBQUM7SUFHRCxJQUFJLFVBQVU7UUFDYixJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtZQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtTQUN0QztRQUVELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQTtJQUN4QixDQUFDO0lBRUQsWUFBWTtRQUNYLElBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQTtRQUNiLE1BQU0sS0FBSyxHQUFHO1lBQ2IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUMzQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ3ZCLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7WUFDM0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUMzQixDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDO1lBQ3JCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUM7WUFDckIsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQztTQUN2QixDQUFBO1FBRUQsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUU7WUFDOUIsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7Z0JBQzlCLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxLQUFLLENBQUE7YUFDakI7aUJBQU0sSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFBO2FBQ3pCO1FBQ0YsQ0FBQyxDQUFDLENBQUE7UUFFRixPQUFPLElBQUksQ0FBQTtJQUNaLENBQUM7Q0FDRDtBQTlDRCxtQ0E4Q0MifQ==