"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const mkdirp_1 = require("mkdirp");
const roots = ['objects', 'screenshots', 'files', 'results'];
class WorkRoot {
    constructor(dataRoot) {
        this.dataRoot = dataRoot;
        this.root = path.join(this.dataRoot, 'flood');
        this.ensureRoots();
    }
    ensureRoots() {
        roots.forEach(r => mkdirp_1.sync(path.join(this.root, r)));
    }
    join(root, ...segments) {
        return path.join(this.root, root, ...segments);
    }
}
exports.default = WorkRoot;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV29ya1Jvb3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvV29ya1Jvb3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNEI7QUFDNUIsbUNBQTJDO0FBRzNDLE1BQU0sS0FBSyxHQUFXLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFFcEU7SUFFQyxZQUFtQixRQUFnQjtRQUFoQixhQUFRLEdBQVIsUUFBUSxDQUFRO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO1FBQzdDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTtJQUNuQixDQUFDO0lBRUQsV0FBVztRQUNWLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN4RCxDQUFDO0lBRUQsSUFBSSxDQUFDLElBQVUsRUFBRSxHQUFHLFFBQWtCO1FBQ3JDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFBO0lBQy9DLENBQUM7Q0FDRDtBQWRELDJCQWNDIn0=