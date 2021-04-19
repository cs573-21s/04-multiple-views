/**
 * year: Int
 * ageGroup: Int (0-24: 0, 25-34: 1, 35-44: 2, 45-54: 3, 55+: 4, Unaccounted: 5)
 * state: String
 * value: Int
 */
class Element {
    constructor(year, ageGroup, state, value, totalAccounted) {
        this.year = parseInt(year);
        this.ageGroup = getAgeGroup(ageGroup);
        this.state = state;
        this.value = this.ageGroup == 5 ? parseInteger(value) - totalAccounted : parseInteger(value);
    }
}

class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function parseInteger(i) {
    const parsed = parseInt(i);
    return isNaN(parsed) ? 0 : parsed;
}

function getAgeGroup(ageGroup) {
    if (ageGroup.includes("0-24")) return 0;
    else if (ageGroup.includes("25-34")) return 1;
    else if (ageGroup.includes("35-44")) return 2;
    else if (ageGroup.includes("45-54")) return 3;
    else if (ageGroup.includes("55+")) return 4;
    else if (ageGroup.includes("Total") || ageGroup.includes("Unknown")) return 5;
    else throw new Error("The age group does not match any of the following formats.");
}

function getAgeString(ageGroup) {
    switch(parseInt(ageGroup)) {
        case 0: return "0-24";
        case 1: return "25-34";
        case 2: return "35-44";
        case 3: return "45-54";
        case 4: return "55+";
        case 5: return "Unknown";
        default:
            throw new Error("This is not a valid age group.");
    }
}

class Dim3Table {
    constructor(yearDict, ageDict, stateDict) {
        this.yearDict = yearDict;
        this.ageDict = ageDict;
        this.stateDict = stateDict;
    }

    getYearData(ages, states) {
        var result = [];
        for (var year in this.yearDict) {
            var date = new Date("1970-06-01");
            date.setFullYear(year);
            var point = new Point2D(date, 0);
            for (var data of this.yearDict[year])
                if (ages.includes(data.ageGroup) && states.includes(data.state))
                    point.y += data.value;
            result.push(point);
        }
        return result;
    }

    getAgeData(yearBottom, yearTop, states) {
        var result = [];
        for (var age in this.ageDict) {
            var point = new Point2D(getAgeString(age), 0);
            for (var data of this.ageDict[age])
                if (data.year >= yearBottom && data.year <= yearTop && states.includes(data.state))
                    point.y += data.value;
            result.push(point);
        }
        return result;
    }

    getStateData(yearBottom, yearTop, ages) {
        var result = [];
        for (var state in this.stateDict) {
            var point = new Point2D(state, 0);
            for (var data of this.stateDict[state])
                if (data.year >= yearBottom && data.year <= yearTop && ages.includes(data.ageGroup))
                    point.y += data.value;
            result.push(point);
        }
        return result;
    }
}

function csvToDim3Table(csv) {
    if(typeof csv == 'undefined' || typeof csv == 'null')
        throw new Error("There is no data to turn into an object.");
    var yearDict = {}, ageDict = {}, stateDict = {};
    let rows = csv.replaceAll("\"", "").split('\n'), headers = rows[0].split(',');
    for (var i = 1; i < rows.length; i++) {
        let row = rows[i].split(','),
            year = -1,
            totalAccounted = 0,
            state = row[0];
        for (var j = 1; j < row.length; j++) {
            var header = headerInfo(headers[j]);
            if (header["y"] != year) {
                year = header["y"];
                totalAccounted = 0;
            }
            var element = new Element(year, header["a"], state, row[j], totalAccounted);
            totalAccounted += element.value;
            computeIfAbsent(yearDict, element.year, (_) => []).push(element);
            computeIfAbsent(ageDict, element.ageGroup, (_) => []).push(element);
            computeIfAbsent(stateDict, element.state, (_) => []).push(element);
        }
    }
    return new Dim3Table(yearDict, ageDict, stateDict);
}

function computeIfAbsent(obj, key, valueFunc) {
    if (obj.hasOwnProperty(key)) return obj[key];
    let value = valueFunc(key);
    obj[key] = value;
    return value;
}

function removeFromList(list, val) {
    const index = list.indexOf(val);
    if (index > -1) {
        list.splice(index, 1);
        return true;
    } else return false;
}

function headerInfo(header) {
    let h = header.split("__"), result = {};
    result["y"] = parseInt(h[0]);
    result["a"] = h[1];
    return result;
}