/*
 * Copyright 2024 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const PRECISION = 5;
const FACTOR = 10 ** PRECISION;

function fmt(n: number): string {
    if (!Number.isFinite(n)) return '0';
    let v = Math.round(n * FACTOR) / FACTOR;
    if (Object.is(v, -0)) v = 0;
    return String(v);
}

export class Path {
    private pathData: string = "";

    moveTo(x: number, y: number) {
        this.pathData += `M${fmt(x)} ${fmt(y)}`;
    }

    lineTo(x: number, y: number) {
        this.pathData += `L${fmt(x)} ${fmt(y)}`;
    }

    cubicTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
        this.pathData += `C${fmt(c1x)} ${fmt(c1y)} ${fmt(c2x)} ${fmt(c2y)} ${fmt(x)} ${fmt(y)}`;
    }

    close() {
        this.pathData += "Z";
    }

    rewind() {
        this.pathData = "";
    }

    toSvgPathData(): string {
        return this.pathData;
    }

    toString(): string {
        return this.pathData;
    }
}
