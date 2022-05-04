/*!
 * canvg.js - Javascript SVG parser and renderer on Canvas
 * MIT Licensed
 * Gabe Lerner (gabelerner@gmail.com)
 * http://code.google.com/p/canvg/
 *
 * Requires: rgbcolor.js - http://www.phpied.com/rgb-color-parser-in-javascript/
 */
! function() {
    function build() {
        var svg = {};
        return svg.FRAMERATE = 30, svg.MAX_VIRTUAL_PIXELS = 3e4, svg.init = function(ctx) {
            var uniqueId = 0;
            svg.UniqueId = function() {
                return uniqueId++, "canvg" + uniqueId
            }, svg.Definitions = {}, svg.Styles = {}, svg.Animations = [], svg.Images = [], svg.ctx = ctx, svg.ViewPort = new function() {
                this.viewPorts = [], this.Clear = function() {
                    this.viewPorts = []
                }, this.SetCurrent = function(width, height) {
                    this.viewPorts.push({ width: width, height: height })
                }, this.RemoveCurrent = function() {
                    this.viewPorts.pop()
                }, this.Current = function() {
                    return this.viewPorts[this.viewPorts.length - 1]
                }, this.width = function() {
                    return this.Current().width
                }, this.height = function() {
                    return this.Current().height
                }, this.ComputeSize = function(d) {
                    return null != d && "number" == typeof d ? d : "x" == d ? this.width() : "y" == d ? this.height() : Math.sqrt(Math.pow(this.width(), 2) + Math.pow(this.height(), 2)) / Math.sqrt(2)
                }
            }
        }, svg.init(), svg.ImagesLoaded = function() {
            for (var i = 0; i < svg.Images.length; i++)
                if (!svg.Images[i].loaded) return !1;
            return !0
        }, svg.trim = function(s) {
            return s.replace(/^\s+|\s+$/g, "")
        }, svg.compressSpaces = function(s) {
            return s.replace(/[\s\r\t\n]+/gm, " ")
        }, svg.ajax = function(url) {
            var AJAX;
            return AJAX = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP"), AJAX ? (AJAX.open("GET", url, !1), AJAX.send(null), AJAX.responseText) : null
        }, svg.parseXml = function(xml) {
            if (window.DOMParser) {
                var parser = new DOMParser;
                return parser.parseFromString(xml, "text/xml")
            }
            xml = xml.replace(/<!DOCTYPE svg[^>]*>/, "");
            var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
            return xmlDoc.async = "false", xmlDoc.loadXML(xml), xmlDoc
        }, svg.Property = function(name, value) {
            this.name = name, this.value = value
        }, svg.Property.prototype.getValue = function() {
            return this.value
        }, svg.Property.prototype.hasValue = function() {
            return null != this.value && "" !== this.value
        }, svg.Property.prototype.numValue = function() {
            if (!this.hasValue()) return 0;
            var n = parseFloat(this.value);
            return (this.value + "").match(/%$/) && (n /= 100), n
        }, svg.Property.prototype.valueOrDefault = function(def) {
            return this.hasValue() ? this.value : def
        }, svg.Property.prototype.numValueOrDefault = function(def) {
            return this.hasValue() ? this.numValue() : def
        }, svg.Property.prototype.addOpacity = function(opacity) {
            var newValue = this.value;
            if (null != opacity && "" != opacity && "string" == typeof this.value) {
                var color = new RGBColor(this.value);
                color.ok && (newValue = "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + opacity + ")")
            }
            return new svg.Property(this.name, newValue)
        }, svg.Property.prototype.getDefinition = function() {
            var name = this.value.match(/#([^\)'"]+)/);
            return name && (name = name[1]), name || (name = this.value), svg.Definitions[name]
        }, svg.Property.prototype.isUrlDefinition = function() {
            return 0 == this.value.indexOf("url(")
        }, svg.Property.prototype.getFillStyleDefinition = function(e, opacityProp) {
            var def = this.getDefinition();
            if (null != def && def.createGradient) return def.createGradient(svg.ctx, e, opacityProp);
            if (null != def && def.createPattern) {
                if (def.getHrefAttribute().hasValue()) {
                    var pt = def.attribute("patternTransform");
                    def = def.getHrefAttribute().getDefinition(), pt.hasValue() && (def.attribute("patternTransform", !0).value = pt.value)
                }
                return def.createPattern(svg.ctx, e)
            }
            return null
        }, svg.Property.prototype.getDPI = function() {
            return 96
        }, svg.Property.prototype.getEM = function(viewPort) {
            var em = 12,
                fontSize = new svg.Property("fontSize", svg.Font.Parse(svg.ctx.font).fontSize);
            return fontSize.hasValue() && (em = fontSize.toPixels(viewPort)), em
        }, svg.Property.prototype.getUnits = function() {
            var s = this.value + "";
            return s.replace(/[0-9\.\-]/g, "")
        }, svg.Property.prototype.toPixels = function(viewPort, processPercent) {
            if (!this.hasValue()) return 0;
            var s = this.value + "";
            if (s.match(/em$/)) return this.numValue() * this.getEM(viewPort);
            if (s.match(/ex$/)) return this.numValue() * this.getEM(viewPort) / 2;
            if (s.match(/px$/)) return this.numValue();
            if (s.match(/pt$/)) return this.numValue() * this.getDPI(viewPort) * (1 / 72);
            if (s.match(/pc$/)) return 15 * this.numValue();
            if (s.match(/cm$/)) return this.numValue() * this.getDPI(viewPort) / 2.54;
            if (s.match(/mm$/)) return this.numValue() * this.getDPI(viewPort) / 25.4;
            if (s.match(/in$/)) return this.numValue() * this.getDPI(viewPort);
            if (s.match(/%$/)) return this.numValue() * svg.ViewPort.ComputeSize(viewPort);
            var n = this.numValue();
            return processPercent && 1 > n ? n * svg.ViewPort.ComputeSize(viewPort) : n
        }, svg.Property.prototype.toMilliseconds = function() {
            if (!this.hasValue()) return 0;
            var s = this.value + "";
            return s.match(/s$/) ? 1e3 * this.numValue() : (s.match(/ms$/), this.numValue())
        }, svg.Property.prototype.toRadians = function() {
            if (!this.hasValue()) return 0;
            var s = this.value + "";
            return s.match(/deg$/) ? this.numValue() * (Math.PI / 180) : s.match(/grad$/) ? this.numValue() * (Math.PI / 200) : s.match(/rad$/) ? this.numValue() : this.numValue() * (Math.PI / 180)
        }, svg.Font = new function() {
            this.Styles = "normal|italic|oblique|inherit", this.Variants = "normal|small-caps|inherit", this.Weights = "normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit", this.CreateFont = function(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit) {
                var f = null != inherit ? this.Parse(inherit) : this.CreateFont("", "", "", "", "", svg.ctx.font);
                return {
                    fontFamily: fontFamily || f.fontFamily,
                    fontSize: fontSize || f.fontSize,
                    fontStyle: fontStyle || f.fontStyle,
                    fontWeight: fontWeight || f.fontWeight,
                    fontVariant: fontVariant || f.fontVariant,
                    toString: function() {
                        return [this.fontStyle, this.fontVariant, this.fontWeight, this.fontSize, this.fontFamily].join(" ")
                    }
                }
            };
            var that = this;
            this.Parse = function(s) {
                for (var f = {}, d = svg.trim(svg.compressSpaces(s || "")).split(" "), set = {
                        fontSize: !1,
                        fontStyle: !1,
                        fontWeight: !1,
                        fontVariant: !1
                    }, ff = "", i = 0; i < d.length; i++) set.fontStyle || -1 == that.Styles.indexOf(d[i]) ? set.fontVariant || -1 == that.Variants.indexOf(d[i]) ? set.fontWeight || -1 == that.Weights.indexOf(d[i]) ? set.fontSize ? "inherit" != d[i] && (ff += d[i]) : ("inherit" != d[i] && (f.fontSize = d[i].split("/")[0]), set.fontStyle = set.fontVariant = set.fontWeight = set.fontSize = !0) : ("inherit" != d[i] && (f.fontWeight = d[i]), set.fontStyle = set.fontVariant = set.fontWeight = !0) : ("inherit" != d[i] && (f.fontVariant = d[i]), set.fontStyle = set.fontVariant = !0) : ("inherit" != d[i] && (f.fontStyle = d[i]), set.fontStyle = !0);
                return "" != ff && (f.fontFamily = ff), f
            }
        }, svg.ToNumberArray = function(s) {
            for (var a = svg.trim(svg.compressSpaces((s || "").replace(/,/g, " "))).split(" "), i = 0; i < a.length; i++) a[i] = parseFloat(a[i]);
            return a
        }, svg.Point = function(x, y) {
            this.x = x, this.y = y
        }, svg.Point.prototype.angleTo = function(p) {
            return Math.atan2(p.y - this.y, p.x - this.x)
        }, svg.Point.prototype.applyTransform = function(v) {
            var xp = this.x * v[0] + this.y * v[2] + v[4],
                yp = this.x * v[1] + this.y * v[3] + v[5];
            this.x = xp, this.y = yp
        }, svg.CreatePoint = function(s) {
            var a = svg.ToNumberArray(s);
            return new svg.Point(a[0], a[1])
        }, svg.CreatePath = function(s) {
            for (var a = svg.ToNumberArray(s), path = [], i = 0; i < a.length; i += 2) path.push(new svg.Point(a[i], a[i + 1]));
            return path
        }, svg.BoundingBox = function(x1, y1, x2, y2) {
            this.x1 = Number.NaN, this.y1 = Number.NaN, this.x2 = Number.NaN, this.y2 = Number.NaN, this.x = function() {
                return this.x1
            }, this.y = function() {
                return this.y1
            }, this.width = function() {
                return this.x2 - this.x1
            }, this.height = function() {
                return this.y2 - this.y1
            }, this.addPoint = function(x, y) {
                null != x && ((isNaN(this.x1) || isNaN(this.x2)) && (this.x1 = x, this.x2 = x), x < this.x1 && (this.x1 = x), x > this.x2 && (this.x2 = x)), null != y && ((isNaN(this.y1) || isNaN(this.y2)) && (this.y1 = y, this.y2 = y), y < this.y1 && (this.y1 = y), y > this.y2 && (this.y2 = y))
            }, this.addX = function(x) {
                this.addPoint(x, null)
            }, this.addY = function(y) {
                this.addPoint(null, y)
            }, this.addBoundingBox = function(bb) {
                this.addPoint(bb.x1, bb.y1), this.addPoint(bb.x2, bb.y2)
            }, this.addQuadraticCurve = function(p0x, p0y, p1x, p1y, p2x, p2y) {
                var cp1x = p0x + 2 / 3 * (p1x - p0x),
                    cp1y = p0y + 2 / 3 * (p1y - p0y),
                    cp2x = cp1x + 1 / 3 * (p2x - p0x),
                    cp2y = cp1y + 1 / 3 * (p2y - p0y);
                this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y)
            }, this.addBezierCurve = function(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
                var p0 = [p0x, p0y],
                    p1 = [p1x, p1y],
                    p2 = [p2x, p2y],
                    p3 = [p3x, p3y];
                for (this.addPoint(p0[0], p0[1]), this.addPoint(p3[0], p3[1]), i = 0; 1 >= i; i++) {
                    var f = function(t) {
                            return Math.pow(1 - t, 3) * p0[i] + 3 * Math.pow(1 - t, 2) * t * p1[i] + 3 * (1 - t) * Math.pow(t, 2) * p2[i] + Math.pow(t, 3) * p3[i]
                        },
                        b = 6 * p0[i] - 12 * p1[i] + 6 * p2[i],
                        a = -3 * p0[i] + 9 * p1[i] - 9 * p2[i] + 3 * p3[i],
                        c = 3 * p1[i] - 3 * p0[i];
                    if (0 != a) {
                        var b2ac = Math.pow(b, 2) - 4 * c * a;
                        if (!(0 > b2ac)) {
                            var t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
                            t1 > 0 && 1 > t1 && (0 == i && this.addX(f(t1)), 1 == i && this.addY(f(t1)));
                            var t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
                            t2 > 0 && 1 > t2 && (0 == i && this.addX(f(t2)), 1 == i && this.addY(f(t2)))
                        }
                    } else {
                        if (0 == b) continue;
                        var t = -c / b;
                        t > 0 && 1 > t && (0 == i && this.addX(f(t)), 1 == i && this.addY(f(t)))
                    }
                }
            }, this.isPointInBox = function(x, y) {
                return this.x1 <= x && x <= this.x2 && this.y1 <= y && y <= this.y2
            }, this.addPoint(x1, y1), this.addPoint(x2, y2)
        }, svg.Transform = function(v) {
            var that = this;
            this.Type = {}, this.Type.translate = function(s) {
                this.p = svg.CreatePoint(s), this.apply = function(ctx) {
                    ctx.translate(this.p.x || 0, this.p.y || 0)
                }, this.unapply = function(ctx) {
                    ctx.translate(-1 * this.p.x || 0, -1 * this.p.y || 0)
                }, this.applyToPoint = function(p) {
                    p.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0])
                }
            }, this.Type.rotate = function(s) {
                var a = svg.ToNumberArray(s);
                this.angle = new svg.Property("angle", a[0]), this.cx = a[1] || 0, this.cy = a[2] || 0, this.apply = function(ctx) {
                    ctx.translate(this.cx, this.cy), ctx.rotate(this.angle.toRadians()), ctx.translate(-this.cx, -this.cy)
                }, this.unapply = function(ctx) {
                    ctx.translate(this.cx, this.cy), ctx.rotate(-1 * this.angle.toRadians()), ctx.translate(-this.cx, -this.cy)
                }, this.applyToPoint = function(p) {
                    var a = this.angle.toRadians();
                    p.applyTransform([1, 0, 0, 1, this.p.x || 0, this.p.y || 0]), p.applyTransform([Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]), p.applyTransform([1, 0, 0, 1, -this.p.x || 0, -this.p.y || 0])
                }
            }, this.Type.scale = function(s) {
                this.p = svg.CreatePoint(s), this.apply = function(ctx) {
                    ctx.scale(this.p.x || 1, this.p.y || this.p.x || 1)
                }, this.unapply = function(ctx) {
                    ctx.scale(1 / this.p.x || 1, 1 / this.p.y || this.p.x || 1)
                }, this.applyToPoint = function(p) {
                    p.applyTransform([this.p.x || 0, 0, 0, this.p.y || 0, 0, 0])
                }
            }, this.Type.matrix = function(s) {
                this.m = svg.ToNumberArray(s), this.apply = function(ctx) {
                    ctx.transform(this.m[0], this.m[1], this.m[2], this.m[3], this.m[4], this.m[5])
                }, this.applyToPoint = function(p) {
                    p.applyTransform(this.m)
                }
            }, this.Type.SkewBase = function(s) {
                this.base = that.Type.matrix, this.base(s), this.angle = new svg.Property("angle", s)
            }, this.Type.SkewBase.prototype = new this.Type.matrix, this.Type.skewX = function(s) {
                this.base = that.Type.SkewBase, this.base(s), this.m = [1, 0, Math.tan(this.angle.toRadians()), 1, 0, 0]
            }, this.Type.skewX.prototype = new this.Type.SkewBase, this.Type.skewY = function(s) {
                this.base = that.Type.SkewBase, this.base(s), this.m = [1, Math.tan(this.angle.toRadians()), 0, 1, 0, 0]
            }, this.Type.skewY.prototype = new this.Type.SkewBase, this.transforms = [], this.apply = function(ctx) {
                for (var i = 0; i < this.transforms.length; i++) this.transforms[i].apply(ctx)
            }, this.unapply = function(ctx) {
                for (var i = this.transforms.length - 1; i >= 0; i--) this.transforms[i].unapply(ctx)
            }, this.applyToPoint = function(p) {
                for (var i = 0; i < this.transforms.length; i++) this.transforms[i].applyToPoint(p)
            };
            for (var data = svg.trim(svg.compressSpaces(v)).replace(/\)(\s?,\s?)/g, ") ").split(/\s(?=[a-z])/), i = 0; i < data.length; i++) {
                var type = svg.trim(data[i].split("(")[0]),
                    s = data[i].split("(")[1].replace(")", ""),
                    transform = new this.Type[type](s);
                transform.type = type, this.transforms.push(transform)
            }
        }, svg.AspectRatio = function(ctx, aspectRatio, width, desiredWidth, height, desiredHeight, minX, minY, refX, refY) {
            aspectRatio = svg.compressSpaces(aspectRatio), aspectRatio = aspectRatio.replace(/^defer\s/, "");
            var align = aspectRatio.split(" ")[0] || "xMidYMid",
                meetOrSlice = aspectRatio.split(" ")[1] || "meet",
                scaleX = width / desiredWidth,
                scaleY = height / desiredHeight,
                scaleMin = Math.min(scaleX, scaleY),
                scaleMax = Math.max(scaleX, scaleY);
            "meet" == meetOrSlice && (desiredWidth *= scaleMin, desiredHeight *= scaleMin), "slice" == meetOrSlice && (desiredWidth *= scaleMax, desiredHeight *= scaleMax), refX = new svg.Property("refX", refX), refY = new svg.Property("refY", refY), refX.hasValue() && refY.hasValue() ? ctx.translate(-scaleMin * refX.toPixels("x"), -scaleMin * refY.toPixels("y")) : (align.match(/^xMid/) && ("meet" == meetOrSlice && scaleMin == scaleY || "slice" == meetOrSlice && scaleMax == scaleY) && ctx.translate(width / 2 - desiredWidth / 2, 0), align.match(/YMid$/) && ("meet" == meetOrSlice && scaleMin == scaleX || "slice" == meetOrSlice && scaleMax == scaleX) && ctx.translate(0, height / 2 - desiredHeight / 2), align.match(/^xMax/) && ("meet" == meetOrSlice && scaleMin == scaleY || "slice" == meetOrSlice && scaleMax == scaleY) && ctx.translate(width - desiredWidth, 0), align.match(/YMax$/) && ("meet" == meetOrSlice && scaleMin == scaleX || "slice" == meetOrSlice && scaleMax == scaleX) && ctx.translate(0, height - desiredHeight)), "none" == align ? ctx.scale(scaleX, scaleY) : "meet" == meetOrSlice ? ctx.scale(scaleMin, scaleMin) : "slice" == meetOrSlice && ctx.scale(scaleMax, scaleMax), ctx.translate(null == minX ? 0 : -minX, null == minY ? 0 : -minY)
        }, svg.Element = {}, svg.EmptyProperty = new svg.Property("EMPTY", ""), svg.Element.ElementBase = function(node) {
            if (this.attributes = {}, this.styles = {}, this.children = [], this.attribute = function(name, createIfNotExists) {
                    var a = this.attributes[name];
                    return null != a ? a : (1 == createIfNotExists && (a = new svg.Property(name, ""), this.attributes[name] = a), a || svg.EmptyProperty)
                }, this.getHrefAttribute = function() {
                    for (var a in this.attributes)
                        if (a.match(/:href$/)) return this.attributes[a];
                    return svg.EmptyProperty
                }, this.style = function(name, createIfNotExists) {
                    var s = this.styles[name];
                    if (null != s) return s;
                    var a = this.attribute(name);
                    if (null != a && a.hasValue()) return this.styles[name] = a, a;
                    var p = this.parent;
                    if (null != p) {
                        var ps = p.style(name);
                        if (null != ps && ps.hasValue()) return ps
                    }
                    return 1 == createIfNotExists && (s = new svg.Property(name, ""), this.styles[name] = s), s || svg.EmptyProperty
                }, this.render = function(ctx) {
                    if ("none" != this.style("display").value && "hidden" != this.attribute("visibility").value) {
                        if (ctx.save(), this.attribute("mask").hasValue()) {
                            var mask = this.attribute("mask").getDefinition();
                            null != mask && mask.apply(ctx, this)
                        } else if (this.style("filter").hasValue()) {
                            var filter = this.style("filter").getDefinition();
                            null != filter && filter.apply(ctx, this)
                        } else this.setContext(ctx), this.renderChildren(ctx), this.clearContext(ctx);
                        ctx.restore()
                    }
                }, this.setContext = function() {}, this.clearContext = function() {}, this.renderChildren = function(ctx) {
                    for (var i = 0; i < this.children.length; i++) this.children[i].render(ctx)
                }, this.addChild = function(childNode, create) {
                    var child = childNode;
                    create && (child = svg.CreateElement(childNode)), child.parent = this, this.children.push(child)
                }, null != node && 1 == node.nodeType) {
                for (var i = 0; i < node.childNodes.length; i++) {
                    var childNode = node.childNodes[i];
                    if (1 == childNode.nodeType && this.addChild(childNode, !0), this.captureTextNodes && 3 == childNode.nodeType) {
                        var text = childNode.nodeValue || childNode.text || "";
                        "" != svg.trim(svg.compressSpaces(text)) && this.addChild(new svg.Element.tspan(childNode), !1)
                    }
                }
                for (var i = 0; i < node.attributes.length; i++) {
                    var attribute = node.attributes[i];
                    this.attributes[attribute.nodeName] = new svg.Property(attribute.nodeName, attribute.nodeValue)
                }
                var styles = svg.Styles[node.nodeName];
                if (null != styles)
                    for (var name in styles) this.styles[name] = styles[name];
                if (this.attribute("class").hasValue())
                    for (var classes = svg.compressSpaces(this.attribute("class").value).split(" "), j = 0; j < classes.length; j++) {
                        if (styles = svg.Styles["." + classes[j]], null != styles)
                            for (var name in styles) this.styles[name] = styles[name];
                        if (styles = svg.Styles[node.nodeName + "." + classes[j]], null != styles)
                            for (var name in styles) this.styles[name] = styles[name]
                    }
                if (this.attribute("id").hasValue()) {
                    var styles = svg.Styles["#" + this.attribute("id").value];
                    if (null != styles)
                        for (var name in styles) this.styles[name] = styles[name]
                }
                if (this.attribute("style").hasValue())
                    for (var styles = this.attribute("style").value.split(";"), i = 0; i < styles.length; i++)
                        if ("" != svg.trim(styles[i])) {
                            var style = styles[i].split(":"),
                                name = svg.trim(style[0]),
                                value = svg.trim(style[1]);
                            this.styles[name] = new svg.Property(name, value)
                        }
                this.attribute("id").hasValue() && null == svg.Definitions[this.attribute("id").value] && (svg.Definitions[this.attribute("id").value] = this)
            }
        }, svg.Element.RenderedElementBase = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.setContext = function(ctx) {
                if (this.style("fill").isUrlDefinition()) {
                    var fs = this.style("fill").getFillStyleDefinition(this, this.style("fill-opacity"));
                    null != fs && (ctx.fillStyle = fs)
                } else if (this.style("fill").hasValue()) {
                    var fillStyle = this.style("fill");
                    "currentColor" == fillStyle.value && (fillStyle.value = this.style("color").value), ctx.fillStyle = "none" == fillStyle.value ? "rgba(0,0,0,0)" : fillStyle.value
                }
                if (this.style("fill-opacity").hasValue()) {
                    var fillStyle = new svg.Property("fill", ctx.fillStyle);
                    fillStyle = fillStyle.addOpacity(this.style("fill-opacity").value), ctx.fillStyle = fillStyle.value
                }
                if (this.style("stroke").isUrlDefinition()) {
                    var fs = this.style("stroke").getFillStyleDefinition(this, this.style("stroke-opacity"));
                    null != fs && (ctx.strokeStyle = fs)
                } else if (this.style("stroke").hasValue()) {
                    var strokeStyle = this.style("stroke");
                    "currentColor" == strokeStyle.value && (strokeStyle.value = this.style("color").value), ctx.strokeStyle = "none" == strokeStyle.value ? "rgba(0,0,0,0)" : strokeStyle.value
                }
                if (this.style("stroke-opacity").hasValue()) {
                    var strokeStyle = new svg.Property("stroke", ctx.strokeStyle);
                    strokeStyle = strokeStyle.addOpacity(this.style("stroke-opacity").value), ctx.strokeStyle = strokeStyle.value
                }
                if (this.style("stroke-width").hasValue()) {
                    var newLineWidth = this.style("stroke-width").toPixels();
                    ctx.lineWidth = 0 == newLineWidth ? .001 : newLineWidth
                }
                if (this.style("stroke-linecap").hasValue() && (ctx.lineCap = this.style("stroke-linecap").value), this.style("stroke-linejoin").hasValue() && (ctx.lineJoin = this.style("stroke-linejoin").value), this.style("stroke-miterlimit").hasValue() && (ctx.miterLimit = this.style("stroke-miterlimit").value), this.style("stroke-dasharray").hasValue()) {
                    var gaps = svg.ToNumberArray(this.style("stroke-dasharray").value);
                    "undefined" != typeof ctx.setLineDash ? ctx.setLineDash(gaps) : "undefined" != typeof ctx.webkitLineDash ? ctx.webkitLineDash = gaps : "undefined" != typeof ctx.mozDash && (ctx.mozDash = gaps);
                    var offset = this.style("stroke-dashoffset").numValueOrDefault(1);
                    "undefined" != typeof ctx.lineDashOffset ? ctx.lineDashOffset = offset : "undefined" != typeof ctx.webkitLineDashOffset ? ctx.webkitLineDashOffset = offset : "undefined" != typeof ctx.mozDashOffset && (ctx.mozDashOffset = offset)
                }
                if ("undefined" != typeof ctx.font && (ctx.font = svg.Font.CreateFont(this.style("font-style").value, this.style("font-variant").value, this.style("font-weight").value, this.style("font-size").hasValue() ? this.style("font-size").toPixels() + "px" : "", this.style("font-family").value).toString()), this.attribute("transform").hasValue()) {
                    var transform = new svg.Transform(this.attribute("transform").value);
                    transform.apply(ctx)
                }
                if (this.style("clip-path").hasValue()) {
                    var clip = this.style("clip-path").getDefinition();
                    null != clip && clip.apply(ctx)
                }
                this.style("opacity").hasValue() && (ctx.globalAlpha = this.style("opacity").numValue())
            }
        }, svg.Element.RenderedElementBase.prototype = new svg.Element.ElementBase, svg.Element.PathElementBase = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.path = function(ctx) {
                return null != ctx && ctx.beginPath(), new svg.BoundingBox
            }, this.renderChildren = function(ctx) {
                this.path(ctx), svg.Mouse.checkPath(this, ctx), "" != ctx.fillStyle && (this.attribute("fill-rule").hasValue() ? ctx.fill(this.attribute("fill-rule").value) : ctx.fill()), "" != ctx.strokeStyle && ctx.stroke();
                var markers = this.getMarkers();
                if (null != markers) {
                    if (this.style("marker-start").isUrlDefinition()) {
                        var marker = this.style("marker-start").getDefinition();
                        marker.render(ctx, markers[0][0], markers[0][1])
                    }
                    if (this.style("marker-mid").isUrlDefinition())
                        for (var marker = this.style("marker-mid").getDefinition(), i = 1; i < markers.length - 1; i++) marker.render(ctx, markers[i][0], markers[i][1]);
                    if (this.style("marker-end").isUrlDefinition()) {
                        var marker = this.style("marker-end").getDefinition();
                        marker.render(ctx, markers[markers.length - 1][0], markers[markers.length - 1][1])
                    }
                }
            }, this.getBoundingBox = function() {
                return this.path()
            }, this.getMarkers = function() {
                return null
            }
        }, svg.Element.PathElementBase.prototype = new svg.Element.RenderedElementBase, svg.Element.svg = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.baseClearContext = this.clearContext, this.clearContext = function(ctx) {
                this.baseClearContext(ctx), svg.ViewPort.RemoveCurrent()
            }, this.baseSetContext = this.setContext, this.setContext = function(ctx) {
                ctx.strokeStyle = "rgba(0,0,0,0)", ctx.lineCap = "butt", ctx.lineJoin = "miter", ctx.miterLimit = 4, this.baseSetContext(ctx), this.attribute("x").hasValue() || (this.attribute("x", !0).value = 0), this.attribute("y").hasValue() || (this.attribute("y", !0).value = 0), ctx.translate(this.attribute("x").toPixels("x"), this.attribute("y").toPixels("y"));
                var width = svg.ViewPort.width(),
                    height = svg.ViewPort.height();
                if (this.attribute("width").hasValue() || (this.attribute("width", !0).value = "100%"), this.attribute("height").hasValue() || (this.attribute("height", !0).value = "100%"), "undefined" == typeof this.root) {
                    width = this.attribute("width").toPixels("x"), height = this.attribute("height").toPixels("y");
                    var x = 0,
                        y = 0;
                    this.attribute("refX").hasValue() && this.attribute("refY").hasValue() && (x = -this.attribute("refX").toPixels("x"), y = -this.attribute("refY").toPixels("y")), ctx.beginPath(), ctx.moveTo(x, y), ctx.lineTo(width, y), ctx.lineTo(width, height), ctx.lineTo(x, height), ctx.closePath(), ctx.clip()
                }
                if (svg.ViewPort.SetCurrent(width, height), this.attribute("viewBox").hasValue()) {
                    var viewBox = svg.ToNumberArray(this.attribute("viewBox").value),
                        minX = viewBox[0],
                        minY = viewBox[1];
                    width = viewBox[2], height = viewBox[3], svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, svg.ViewPort.width(), width, svg.ViewPort.height(), height, minX, minY, this.attribute("refX").value, this.attribute("refY").value), svg.ViewPort.RemoveCurrent(), svg.ViewPort.SetCurrent(viewBox[2], viewBox[3])
                }
            }
        }, svg.Element.svg.prototype = new svg.Element.RenderedElementBase, svg.Element.rect = function(node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.path = function(ctx) {
                var x = this.attribute("x").toPixels("x"),
                    y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"),
                    height = this.attribute("height").toPixels("y"),
                    rx = this.attribute("rx").toPixels("x"),
                    ry = this.attribute("ry").toPixels("y");
                return this.attribute("rx").hasValue() && !this.attribute("ry").hasValue() && (ry = rx), this.attribute("ry").hasValue() && !this.attribute("rx").hasValue() && (rx = ry), rx = Math.min(rx, width / 2), ry = Math.min(ry, height / 2), null != ctx && (ctx.beginPath(), ctx.moveTo(x + rx, y), ctx.lineTo(x + width - rx, y), ctx.quadraticCurveTo(x + width, y, x + width, y + ry), ctx.lineTo(x + width, y + height - ry), ctx.quadraticCurveTo(x + width, y + height, x + width - rx, y + height), ctx.lineTo(x + rx, y + height), ctx.quadraticCurveTo(x, y + height, x, y + height - ry), ctx.lineTo(x, y + ry), ctx.quadraticCurveTo(x, y, x + rx, y), ctx.closePath()), new svg.BoundingBox(x, y, x + width, y + height)
            }
        }, svg.Element.rect.prototype = new svg.Element.PathElementBase, svg.Element.circle = function(node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.path = function(ctx) {
                var cx = this.attribute("cx").toPixels("x"),
                    cy = this.attribute("cy").toPixels("y"),
                    r = this.attribute("r").toPixels();
                return null != ctx && (ctx.beginPath(), ctx.arc(cx, cy, r, 0, 2 * Math.PI, !0), ctx.closePath()), new svg.BoundingBox(cx - r, cy - r, cx + r, cy + r)
            }
        }, svg.Element.circle.prototype = new svg.Element.PathElementBase, svg.Element.ellipse = function(node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.path = function(ctx) {
                var KAPPA = 4 * ((Math.sqrt(2) - 1) / 3),
                    rx = this.attribute("rx").toPixels("x"),
                    ry = this.attribute("ry").toPixels("y"),
                    cx = this.attribute("cx").toPixels("x"),
                    cy = this.attribute("cy").toPixels("y");
                return null != ctx && (ctx.beginPath(), ctx.moveTo(cx, cy - ry), ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy), ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry), ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy), ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry), ctx.closePath()), new svg.BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry)
            }
        }, svg.Element.ellipse.prototype = new svg.Element.PathElementBase, svg.Element.line = function(node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.getPoints = function() {
                return [new svg.Point(this.attribute("x1").toPixels("x"), this.attribute("y1").toPixels("y")), new svg.Point(this.attribute("x2").toPixels("x"), this.attribute("y2").toPixels("y"))]
            }, this.path = function(ctx) {
                var points = this.getPoints();
                return null != ctx && (ctx.beginPath(), ctx.moveTo(points[0].x, points[0].y), ctx.lineTo(points[1].x, points[1].y)), new svg.BoundingBox(points[0].x, points[0].y, points[1].x, points[1].y)
            }, this.getMarkers = function() {
                var points = this.getPoints(),
                    a = points[0].angleTo(points[1]);
                return [
                    [points[0], a],
                    [points[1], a]
                ]
            }
        }, svg.Element.line.prototype = new svg.Element.PathElementBase, svg.Element.polyline = function(node) {
            this.base = svg.Element.PathElementBase, this.base(node), this.points = svg.CreatePath(this.attribute("points").value), this.path = function(ctx) {
                var bb = new svg.BoundingBox(this.points[0].x, this.points[0].y);
                null != ctx && (ctx.beginPath(), ctx.moveTo(this.points[0].x, this.points[0].y));
                for (var i = 1; i < this.points.length; i++) bb.addPoint(this.points[i].x, this.points[i].y), null != ctx && ctx.lineTo(this.points[i].x, this.points[i].y);
                return bb
            }, this.getMarkers = function() {
                for (var markers = [], i = 0; i < this.points.length - 1; i++) markers.push([this.points[i], this.points[i].angleTo(this.points[i + 1])]);
                return markers.push([this.points[this.points.length - 1], markers[markers.length - 1][1]]), markers
            }
        }, svg.Element.polyline.prototype = new svg.Element.PathElementBase, svg.Element.polygon = function(node) {
            this.base = svg.Element.polyline, this.base(node), this.basePath = this.path, this.path = function(ctx) {
                var bb = this.basePath(ctx);
                return null != ctx && (ctx.lineTo(this.points[0].x, this.points[0].y), ctx.closePath()), bb
            }
        }, svg.Element.polygon.prototype = new svg.Element.polyline, svg.Element.path = function(node) {
            this.base = svg.Element.PathElementBase, this.base(node);
            var d = this.attribute("d").value;
            d = d.replace(/,/gm, " "), d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2"), d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2"), d = d.replace(/([MmZzLlHhVvCcSsQqTtAa])([^\s])/gm, "$1 $2"), d = d.replace(/([^\s])([MmZzLlHhVvCcSsQqTtAa])/gm, "$1 $2"), d = d.replace(/([0-9])([+\-])/gm, "$1 $2"), d = d.replace(/(\.[0-9]*)(\.)/gm, "$1 $2"), d = d.replace(/([Aa](\s+[0-9]+){3})\s+([01])\s*([01])/gm, "$1 $3 $4 "), d = svg.compressSpaces(d), d = svg.trim(d), this.PathParser = new function(d) {
                this.tokens = d.split(" "), this.reset = function() {
                    this.i = -1, this.command = "", this.previousCommand = "", this.start = new svg.Point(0, 0), this.control = new svg.Point(0, 0), this.current = new svg.Point(0, 0), this.points = [], this.angles = []
                }, this.isEnd = function() {
                    return this.i >= this.tokens.length - 1
                }, this.isCommandOrEnd = function() {
                    return this.isEnd() ? !0 : null != this.tokens[this.i + 1].match(/^[A-Za-z]$/)
                }, this.isRelativeCommand = function() {
                    switch (this.command) {
                        case "m":
                        case "l":
                        case "h":
                        case "v":
                        case "c":
                        case "s":
                        case "q":
                        case "t":
                        case "a":
                        case "z":
                            return !0
                    }
                    return !1
                }, this.getToken = function() {
                    return this.i++, this.tokens[this.i]
                }, this.getScalar = function() {
                    return parseFloat(this.getToken())
                }, this.nextCommand = function() {
                    this.previousCommand = this.command, this.command = this.getToken()
                }, this.getPoint = function() {
                    var p = new svg.Point(this.getScalar(), this.getScalar());
                    return this.makeAbsolute(p)
                }, this.getAsControlPoint = function() {
                    var p = this.getPoint();
                    return this.control = p, p
                }, this.getAsCurrentPoint = function() {
                    var p = this.getPoint();
                    return this.current = p, p
                }, this.getReflectedControlPoint = function() {
                    if ("c" != this.previousCommand.toLowerCase() && "s" != this.previousCommand.toLowerCase() && "q" != this.previousCommand.toLowerCase() && "t" != this.previousCommand.toLowerCase()) return this.current;
                    var p = new svg.Point(2 * this.current.x - this.control.x, 2 * this.current.y - this.control.y);
                    return p
                }, this.makeAbsolute = function(p) {
                    return this.isRelativeCommand() && (p.x += this.current.x, p.y += this.current.y), p
                }, this.addMarker = function(p, from, priorTo) {
                    null != priorTo && this.angles.length > 0 && null == this.angles[this.angles.length - 1] && (this.angles[this.angles.length - 1] = this.points[this.points.length - 1].angleTo(priorTo)), this.addMarkerAngle(p, null == from ? null : from.angleTo(p))
                }, this.addMarkerAngle = function(p, a) {
                    this.points.push(p), this.angles.push(a)
                }, this.getMarkerPoints = function() {
                    return this.points
                }, this.getMarkerAngles = function() {
                    for (var i = 0; i < this.angles.length; i++)
                        if (null == this.angles[i])
                            for (var j = i + 1; j < this.angles.length; j++)
                                if (null != this.angles[j]) {
                                    this.angles[i] = this.angles[j];
                                    break
                                }
                    return this.angles
                }
            }(d), this.path = function(ctx) {
                var pp = this.PathParser;
                pp.reset();
                var bb = new svg.BoundingBox;
                for (null != ctx && ctx.beginPath(); !pp.isEnd();) switch (pp.nextCommand(), pp.command) {
                    case "M":
                    case "m":
                        var p = pp.getAsCurrentPoint();
                        for (pp.addMarker(p), bb.addPoint(p.x, p.y), null != ctx && ctx.moveTo(p.x, p.y), pp.start = pp.current; !pp.isCommandOrEnd();) {
                            var p = pp.getAsCurrentPoint();
                            pp.addMarker(p, pp.start), bb.addPoint(p.x, p.y), null != ctx && ctx.lineTo(p.x, p.y)
                        }
                        break;
                    case "L":
                    case "l":
                        for (; !pp.isCommandOrEnd();) {
                            var c = pp.current,
                                p = pp.getAsCurrentPoint();
                            pp.addMarker(p, c), bb.addPoint(p.x, p.y), null != ctx && ctx.lineTo(p.x, p.y)
                        }
                        break;
                    case "H":
                    case "h":
                        for (; !pp.isCommandOrEnd();) {
                            var newP = new svg.Point((pp.isRelativeCommand() ? pp.current.x : 0) + pp.getScalar(), pp.current.y);
                            pp.addMarker(newP, pp.current), pp.current = newP, bb.addPoint(pp.current.x, pp.current.y), null != ctx && ctx.lineTo(pp.current.x, pp.current.y)
                        }
                        break;
                    case "V":
                    case "v":
                        for (; !pp.isCommandOrEnd();) {
                            var newP = new svg.Point(pp.current.x, (pp.isRelativeCommand() ? pp.current.y : 0) + pp.getScalar());
                            pp.addMarker(newP, pp.current), pp.current = newP, bb.addPoint(pp.current.x, pp.current.y), null != ctx && ctx.lineTo(pp.current.x, pp.current.y)
                        }
                        break;
                    case "C":
                    case "c":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current,
                                p1 = pp.getPoint(),
                                cntrl = pp.getAsControlPoint(),
                                cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, p1), bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case "S":
                    case "s":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current,
                                p1 = pp.getReflectedControlPoint(),
                                cntrl = pp.getAsControlPoint(),
                                cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, p1), bb.addBezierCurve(curr.x, curr.y, p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.bezierCurveTo(p1.x, p1.y, cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case "Q":
                    case "q":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current,
                                cntrl = pp.getAsControlPoint(),
                                cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, cntrl), bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case "T":
                    case "t":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current,
                                cntrl = pp.getReflectedControlPoint();
                            pp.control = cntrl;
                            var cp = pp.getAsCurrentPoint();
                            pp.addMarker(cp, cntrl, cntrl), bb.addQuadraticCurve(curr.x, curr.y, cntrl.x, cntrl.y, cp.x, cp.y), null != ctx && ctx.quadraticCurveTo(cntrl.x, cntrl.y, cp.x, cp.y)
                        }
                        break;
                    case "A":
                    case "a":
                        for (; !pp.isCommandOrEnd();) {
                            var curr = pp.current,
                                rx = pp.getScalar(),
                                ry = pp.getScalar(),
                                xAxisRotation = pp.getScalar() * (Math.PI / 180),
                                largeArcFlag = pp.getScalar(),
                                sweepFlag = pp.getScalar(),
                                cp = pp.getAsCurrentPoint(),
                                currp = new svg.Point(Math.cos(xAxisRotation) * (curr.x - cp.x) / 2 + Math.sin(xAxisRotation) * (curr.y - cp.y) / 2, -Math.sin(xAxisRotation) * (curr.x - cp.x) / 2 + Math.cos(xAxisRotation) * (curr.y - cp.y) / 2),
                                l = Math.pow(currp.x, 2) / Math.pow(rx, 2) + Math.pow(currp.y, 2) / Math.pow(ry, 2);
                            l > 1 && (rx *= Math.sqrt(l), ry *= Math.sqrt(l));
                            var s = (largeArcFlag == sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rx, 2) * Math.pow(ry, 2) - Math.pow(rx, 2) * Math.pow(currp.y, 2) - Math.pow(ry, 2) * Math.pow(currp.x, 2)) / (Math.pow(rx, 2) * Math.pow(currp.y, 2) + Math.pow(ry, 2) * Math.pow(currp.x, 2)));
                            isNaN(s) && (s = 0);
                            var cpp = new svg.Point(s * rx * currp.y / ry, s * -ry * currp.x / rx),
                                centp = new svg.Point((curr.x + cp.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (curr.y + cp.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y),
                                m = function(v) {
                                    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2))
                                },
                                r = function(u, v) {
                                    return (u[0] * v[0] + u[1] * v[1]) / (m(u) * m(v))
                                },
                                a = function(u, v) {
                                    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(r(u, v))
                                },
                                a1 = a([1, 0], [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry]),
                                u = [(currp.x - cpp.x) / rx, (currp.y - cpp.y) / ry],
                                v = [(-currp.x - cpp.x) / rx, (-currp.y - cpp.y) / ry],
                                ad = a(u, v);
                            r(u, v) <= -1 && (ad = Math.PI), r(u, v) >= 1 && (ad = 0);
                            var dir = 1 - sweepFlag ? 1 : -1,
                                ah = a1 + dir * (ad / 2),
                                halfWay = new svg.Point(centp.x + rx * Math.cos(ah), centp.y + ry * Math.sin(ah));
                            if (pp.addMarkerAngle(halfWay, ah - dir * Math.PI / 2), pp.addMarkerAngle(cp, ah - dir * Math.PI), bb.addPoint(cp.x, cp.y), null != ctx) {
                                var r = rx > ry ? rx : ry,
                                    sx = rx > ry ? 1 : rx / ry,
                                    sy = rx > ry ? ry / rx : 1;
                                ctx.translate(centp.x, centp.y), ctx.rotate(xAxisRotation), ctx.scale(sx, sy), ctx.arc(0, 0, r, a1, a1 + ad, 1 - sweepFlag), ctx.scale(1 / sx, 1 / sy), ctx.rotate(-xAxisRotation), ctx.translate(-centp.x, -centp.y)
                            }
                        }
                        break;
                    case "Z":
                    case "z":
                        null != ctx && ctx.closePath(), pp.current = pp.start
                }
                return bb
            }, this.getMarkers = function() {
                for (var points = this.PathParser.getMarkerPoints(), angles = this.PathParser.getMarkerAngles(), markers = [], i = 0; i < points.length; i++) markers.push([points[i], angles[i]]);
                return markers
            }
        }, svg.Element.path.prototype = new svg.Element.PathElementBase, svg.Element.pattern = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.createPattern = function(ctx) {
                var width = this.attribute("width").toPixels("x", !0),
                    height = this.attribute("height").toPixels("y", !0),
                    tempSvg = new svg.Element.svg;
                tempSvg.attributes.viewBox = new svg.Property("viewBox", this.attribute("viewBox").value), tempSvg.attributes.width = new svg.Property("width", width + "px"), tempSvg.attributes.height = new svg.Property("height", height + "px"), tempSvg.attributes.transform = new svg.Property("transform", this.attribute("patternTransform").value), tempSvg.children = this.children;
                var c = document.createElement("canvas");
                c.width = width, c.height = height;
                var cctx = c.getContext("2d");
                this.attribute("x").hasValue() && this.attribute("y").hasValue() && cctx.translate(this.attribute("x").toPixels("x", !0), this.attribute("y").toPixels("y", !0));
                for (var x = -1; 1 >= x; x++)
                    for (var y = -1; 1 >= y; y++) cctx.save(), cctx.translate(x * c.width, y * c.height), tempSvg.render(cctx), cctx.restore();
                var pattern = ctx.createPattern(c, "repeat");
                return pattern
            }
        }, svg.Element.pattern.prototype = new svg.Element.ElementBase, svg.Element.marker = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.baseRender = this.render, this.render = function(ctx, point, angle) {
                ctx.translate(point.x, point.y), "auto" == this.attribute("orient").valueOrDefault("auto") && ctx.rotate(angle), "strokeWidth" == this.attribute("markerUnits").valueOrDefault("strokeWidth") && ctx.scale(ctx.lineWidth, ctx.lineWidth), ctx.save();
                var tempSvg = new svg.Element.svg;
                tempSvg.attributes.viewBox = new svg.Property("viewBox", this.attribute("viewBox").value), tempSvg.attributes.refX = new svg.Property("refX", this.attribute("refX").value), tempSvg.attributes.refY = new svg.Property("refY", this.attribute("refY").value), tempSvg.attributes.width = new svg.Property("width", this.attribute("markerWidth").value), tempSvg.attributes.height = new svg.Property("height", this.attribute("markerHeight").value), tempSvg.attributes.fill = new svg.Property("fill", this.attribute("fill").valueOrDefault("black")), tempSvg.attributes.stroke = new svg.Property("stroke", this.attribute("stroke").valueOrDefault("none")), tempSvg.children = this.children, tempSvg.render(ctx), ctx.restore(), "strokeWidth" == this.attribute("markerUnits").valueOrDefault("strokeWidth") && ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth), "auto" == this.attribute("orient").valueOrDefault("auto") && ctx.rotate(-angle), ctx.translate(-point.x, -point.y)
            }
        }, svg.Element.marker.prototype = new svg.Element.ElementBase, svg.Element.defs = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.render = function() {}
        }, svg.Element.defs.prototype = new svg.Element.ElementBase, svg.Element.GradientBase = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.gradientUnits = this.attribute("gradientUnits").valueOrDefault("objectBoundingBox"), this.stops = [];
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                "stop" == child.type && this.stops.push(child)
            }
            this.getGradient = function() {}, this.createGradient = function(ctx, element, parentOpacityProp) {
                var stopsContainer = this;
                this.getHrefAttribute().hasValue() && (stopsContainer = this.getHrefAttribute().getDefinition());
                var addParentOpacity = function(color) {
                        if (parentOpacityProp.hasValue()) {
                            var p = new svg.Property("color", color);
                            return p.addOpacity(parentOpacityProp.value).value
                        }
                        return color
                    },
                    g = this.getGradient(ctx, element);
                if (null == g) return addParentOpacity(stopsContainer.stops[stopsContainer.stops.length - 1].color);
                for (var i = 0; i < stopsContainer.stops.length; i++) g.addColorStop(stopsContainer.stops[i].offset, addParentOpacity(stopsContainer.stops[i].color));
                if (this.attribute("gradientTransform").hasValue()) {
                    var rootView = svg.ViewPort.viewPorts[0],
                        rect = new svg.Element.rect;
                    rect.attributes.x = new svg.Property("x", -svg.MAX_VIRTUAL_PIXELS / 3), rect.attributes.y = new svg.Property("y", -svg.MAX_VIRTUAL_PIXELS / 3), rect.attributes.width = new svg.Property("width", svg.MAX_VIRTUAL_PIXELS), rect.attributes.height = new svg.Property("height", svg.MAX_VIRTUAL_PIXELS);
                    var group = new svg.Element.g;
                    group.attributes.transform = new svg.Property("transform", this.attribute("gradientTransform").value), group.children = [rect];
                    var tempSvg = new svg.Element.svg;
                    tempSvg.attributes.x = new svg.Property("x", 0), tempSvg.attributes.y = new svg.Property("y", 0), tempSvg.attributes.width = new svg.Property("width", rootView.width), tempSvg.attributes.height = new svg.Property("height", rootView.height), tempSvg.children = [group];
                    var c = document.createElement("canvas");
                    c.width = rootView.width, c.height = rootView.height;
                    var tempCtx = c.getContext("2d");
                    return tempCtx.fillStyle = g, tempSvg.render(tempCtx), tempCtx.createPattern(c, "no-repeat")
                }
                return g
            }
        }, svg.Element.GradientBase.prototype = new svg.Element.ElementBase, svg.Element.linearGradient = function(node) {
            this.base = svg.Element.GradientBase, this.base(node), this.getGradient = function(ctx, element) {
                var bb = element.getBoundingBox();
                this.attribute("x1").hasValue() || this.attribute("y1").hasValue() || this.attribute("x2").hasValue() || this.attribute("y2").hasValue() || (this.attribute("x1", !0).value = 0, this.attribute("y1", !0).value = 0, this.attribute("x2", !0).value = 1, this.attribute("y2", !0).value = 0);
                var x1 = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("x1").numValue() : this.attribute("x1").toPixels("x"),
                    y1 = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("y1").numValue() : this.attribute("y1").toPixels("y"),
                    x2 = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("x2").numValue() : this.attribute("x2").toPixels("x"),
                    y2 = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("y2").numValue() : this.attribute("y2").toPixels("y");
                return x1 == x2 && y1 == y2 ? null : ctx.createLinearGradient(x1, y1, x2, y2)
            }
        }, svg.Element.linearGradient.prototype = new svg.Element.GradientBase, svg.Element.radialGradient = function(node) {
            this.base = svg.Element.GradientBase, this.base(node), this.getGradient = function(ctx, element) {
                var bb = element.getBoundingBox();
                this.attribute("cx").hasValue() || (this.attribute("cx", !0).value = "50%"), this.attribute("cy").hasValue() || (this.attribute("cy", !0).value = "50%"), this.attribute("r").hasValue() || (this.attribute("r", !0).value = "50%");
                var cx = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("cx").numValue() : this.attribute("cx").toPixels("x"),
                    cy = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("cy").numValue() : this.attribute("cy").toPixels("y"),
                    fx = cx,
                    fy = cy;
                this.attribute("fx").hasValue() && (fx = "objectBoundingBox" == this.gradientUnits ? bb.x() + bb.width() * this.attribute("fx").numValue() : this.attribute("fx").toPixels("x")), this.attribute("fy").hasValue() && (fy = "objectBoundingBox" == this.gradientUnits ? bb.y() + bb.height() * this.attribute("fy").numValue() : this.attribute("fy").toPixels("y"));
                var r = "objectBoundingBox" == this.gradientUnits ? (bb.width() + bb.height()) / 2 * this.attribute("r").numValue() : this.attribute("r").toPixels();
                return ctx.createRadialGradient(fx, fy, 0, cx, cy, r)
            }
        }, svg.Element.radialGradient.prototype = new svg.Element.GradientBase, svg.Element.stop = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.offset = this.attribute("offset").numValue(), this.offset < 0 && (this.offset = 0), this.offset > 1 && (this.offset = 1);
            var stopColor = this.style("stop-color");
            this.style("stop-opacity").hasValue() && (stopColor = stopColor.addOpacity(this.style("stop-opacity").value)), this.color = stopColor.value
        }, svg.Element.stop.prototype = new svg.Element.ElementBase, svg.Element.AnimateBase = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), svg.Animations.push(this), this.duration = 0, this.begin = this.attribute("begin").toMilliseconds(), this.maxDuration = this.begin + this.attribute("dur").toMilliseconds(), this.getProperty = function() {
                var attributeType = this.attribute("attributeType").value,
                    attributeName = this.attribute("attributeName").value;
                return "CSS" == attributeType ? this.parent.style(attributeName, !0) : this.parent.attribute(attributeName, !0)
            }, this.initialValue = null, this.initialUnits = "", this.removed = !1, this.calcValue = function() {
                return ""
            }, this.update = function(delta) {
                if (null == this.initialValue && (this.initialValue = this.getProperty().value, this.initialUnits = this.getProperty().getUnits()), this.duration > this.maxDuration) {
                    if ("indefinite" != this.attribute("repeatCount").value && "indefinite" != this.attribute("repeatDur").value) return "remove" != this.attribute("fill").valueOrDefault("remove") || this.removed ? !1 : (this.removed = !0, this.getProperty().value = this.initialValue, !0);
                    this.duration = 0
                }
                this.duration = this.duration + delta;
                var updated = !1;
                if (this.begin < this.duration) {
                    var newValue = this.calcValue();
                    if (this.attribute("type").hasValue()) {
                        var type = this.attribute("type").value;
                        newValue = type + "(" + newValue + ")"
                    }
                    this.getProperty().value = newValue, updated = !0
                }
                return updated
            }, this.from = this.attribute("from"), this.to = this.attribute("to"), this.values = this.attribute("values"), this.values.hasValue() && (this.values.value = this.values.value.split(";")), this.progress = function() {
                var ret = { progress: (this.duration - this.begin) / (this.maxDuration - this.begin) };
                if (this.values.hasValue()) {
                    var p = ret.progress * (this.values.value.length - 1),
                        lb = Math.floor(p),
                        ub = Math.ceil(p);
                    ret.from = new svg.Property("from", parseFloat(this.values.value[lb])), ret.to = new svg.Property("to", parseFloat(this.values.value[ub])), ret.progress = (p - lb) / (ub - lb)
                } else ret.from = this.from, ret.to = this.to;
                return ret
            }
        }, svg.Element.AnimateBase.prototype = new svg.Element.ElementBase, svg.Element.animate = function(node) {
            this.base = svg.Element.AnimateBase, this.base(node), this.calcValue = function() {
                var p = this.progress(),
                    newValue = p.from.numValue() + (p.to.numValue() - p.from.numValue()) * p.progress;
                return newValue + this.initialUnits
            }
        }, svg.Element.animate.prototype = new svg.Element.AnimateBase, svg.Element.animateColor = function(node) {
            this.base = svg.Element.AnimateBase, this.base(node), this.calcValue = function() {
                var p = this.progress(),
                    from = new RGBColor(p.from.value),
                    to = new RGBColor(p.to.value);
                if (from.ok && to.ok) {
                    var r = from.r + (to.r - from.r) * p.progress,
                        g = from.g + (to.g - from.g) * p.progress,
                        b = from.b + (to.b - from.b) * p.progress;
                    return "rgb(" + parseInt(r, 10) + "," + parseInt(g, 10) + "," + parseInt(b, 10) + ")"
                }
                return this.attribute("from").value
            }
        }, svg.Element.animateColor.prototype = new svg.Element.AnimateBase, svg.Element.animateTransform = function(node) {
            this.base = svg.Element.AnimateBase, this.base(node), this.calcValue = function() {
                for (var p = this.progress(), from = svg.ToNumberArray(p.from.value), to = svg.ToNumberArray(p.to.value), newValue = "", i = 0; i < from.length; i++) newValue += from[i] + (to[i] - from[i]) * p.progress + " ";
                return newValue
            }
        }, svg.Element.animateTransform.prototype = new svg.Element.animate, svg.Element.font = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.horizAdvX = this.attribute("horiz-adv-x").numValue(), this.isRTL = !1, this.isArabic = !1, this.fontFace = null, this.missingGlyph = null, this.glyphs = [];
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                "font-face" == child.type ? (this.fontFace = child, child.style("font-family").hasValue() && (svg.Definitions[child.style("font-family").value] = this)) : "missing-glyph" == child.type ? this.missingGlyph = child : "glyph" == child.type && ("" != child.arabicForm ? (this.isRTL = !0, this.isArabic = !0, "undefined" == typeof this.glyphs[child.unicode] && (this.glyphs[child.unicode] = []), this.glyphs[child.unicode][child.arabicForm] = child) : this.glyphs[child.unicode] = child)
            }
        }, svg.Element.font.prototype = new svg.Element.ElementBase, svg.Element.fontface = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.ascent = this.attribute("ascent").value, this.descent = this.attribute("descent").value, this.unitsPerEm = this.attribute("units-per-em").numValue()
        }, svg.Element.fontface.prototype = new svg.Element.ElementBase, svg.Element.missingglyph = function(node) {
            this.base = svg.Element.path, this.base(node), this.horizAdvX = 0
        }, svg.Element.missingglyph.prototype = new svg.Element.path, svg.Element.glyph = function(node) {
            this.base = svg.Element.path, this.base(node), this.horizAdvX = this.attribute("horiz-adv-x").numValue(), this.unicode = this.attribute("unicode").value, this.arabicForm = this.attribute("arabic-form").value
        }, svg.Element.glyph.prototype = new svg.Element.path, svg.Element.text = function(node) {
            this.captureTextNodes = !0, this.base = svg.Element.RenderedElementBase, this.base(node), this.baseSetContext = this.setContext, this.setContext = function(ctx) {
                this.baseSetContext(ctx), this.style("dominant-baseline").hasValue() && (ctx.textBaseline = this.style("dominant-baseline").value), this.style("alignment-baseline").hasValue() && (ctx.textBaseline = this.style("alignment-baseline").value)
            }, this.getBoundingBox = function() {
                return new svg.BoundingBox(this.attribute("x").toPixels("x"), this.attribute("y").toPixels("y"), 0, 0)
            }, this.renderChildren = function(ctx) {
                this.x = this.attribute("x").toPixels("x"), this.y = this.attribute("y").toPixels("y"), this.x += this.getAnchorDelta(ctx, this, 0);
                for (var i = 0; i < this.children.length; i++) this.renderChild(ctx, this, i)
            }, this.getAnchorDelta = function(ctx, parent, startI) {
                var textAnchor = this.style("text-anchor").valueOrDefault("start");
                if ("start" != textAnchor) {
                    for (var width = 0, i = startI; i < parent.children.length; i++) {
                        var child = parent.children[i];
                        if (i > startI && child.attribute("x").hasValue()) break;
                        width += child.measureTextRecursive(ctx)
                    }
                    return -1 * ("end" == textAnchor ? width : width / 2)
                }
                return 0
            }, this.renderChild = function(ctx, parent, i) {
                var child = parent.children[i];
                child.attribute("x").hasValue() ? child.x = child.attribute("x").toPixels("x") + this.getAnchorDelta(ctx, parent, i) : (this.attribute("dx").hasValue() && (this.x += this.attribute("dx").toPixels("x")), child.attribute("dx").hasValue() && (this.x += child.attribute("dx").toPixels("x")), child.x = this.x), this.x = child.x + child.measureText(ctx), child.attribute("y").hasValue() ? child.y = child.attribute("y").toPixels("y") : (this.attribute("dy").hasValue() && (this.y += this.attribute("dy").toPixels("y")), child.attribute("dy").hasValue() && (this.y += child.attribute("dy").toPixels("y")), child.y = this.y), this.y = child.y, child.render(ctx);
                for (var i = 0; i < child.children.length; i++) this.renderChild(ctx, child, i)
            }
        }, svg.Element.text.prototype = new svg.Element.RenderedElementBase, svg.Element.TextElementBase = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.getGlyph = function(font, text, i) {
                var c = text[i],
                    glyph = null;
                if (font.isArabic) {
                    var arabicForm = "isolated";
                    (0 == i || " " == text[i - 1]) && i < text.length - 2 && " " != text[i + 1] && (arabicForm = "terminal"), i > 0 && " " != text[i - 1] && i < text.length - 2 && " " != text[i + 1] && (arabicForm = "medial"), i > 0 && " " != text[i - 1] && (i == text.length - 1 || " " == text[i + 1]) && (arabicForm = "initial"), "undefined" != typeof font.glyphs[c] && (glyph = font.glyphs[c][arabicForm], null == glyph && "glyph" == font.glyphs[c].type && (glyph = font.glyphs[c]))
                } else glyph = font.glyphs[c];
                return null == glyph && (glyph = font.missingGlyph), glyph
            }, this.renderChildren = function(ctx) {
                var customFont = this.parent.style("font-family").getDefinition();
                if (null == customFont) "" != ctx.fillStyle && ctx.fillText(svg.compressSpaces(this.getText()), this.x, this.y), "" != ctx.strokeStyle && ctx.strokeText(svg.compressSpaces(this.getText()), this.x, this.y);
                else {
                    var fontSize = this.parent.style("font-size").numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize),
                        fontStyle = this.parent.style("font-style").valueOrDefault(svg.Font.Parse(svg.ctx.font).fontStyle),
                        text = this.getText();
                    customFont.isRTL && (text = text.split("").reverse().join(""));
                    for (var dx = svg.ToNumberArray(this.parent.attribute("dx").value), i = 0; i < text.length; i++) {
                        var glyph = this.getGlyph(customFont, text, i),
                            scale = fontSize / customFont.fontFace.unitsPerEm;
                        ctx.translate(this.x, this.y), ctx.scale(scale, -scale);
                        var lw = ctx.lineWidth;
                        ctx.lineWidth = ctx.lineWidth * customFont.fontFace.unitsPerEm / fontSize, "italic" == fontStyle && ctx.transform(1, 0, .4, 1, 0, 0), glyph.render(ctx), "italic" == fontStyle && ctx.transform(1, 0, -.4, 1, 0, 0), ctx.lineWidth = lw, ctx.scale(1 / scale, -1 / scale), ctx.translate(-this.x, -this.y), this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / customFont.fontFace.unitsPerEm, "undefined" == typeof dx[i] || isNaN(dx[i]) || (this.x += dx[i])
                    }
                }
            }, this.getText = function() {}, this.measureTextRecursive = function(ctx) {
                for (var width = this.measureText(ctx), i = 0; i < this.children.length; i++) width += this.children[i].measureTextRecursive(ctx);
                return width
            }, this.measureText = function(ctx) {
                var customFont = this.parent.style("font-family").getDefinition();
                if (null != customFont) {
                    var fontSize = this.parent.style("font-size").numValueOrDefault(svg.Font.Parse(svg.ctx.font).fontSize),
                        measure = 0,
                        text = this.getText();
                    customFont.isRTL && (text = text.split("").reverse().join(""));
                    for (var dx = svg.ToNumberArray(this.parent.attribute("dx").value), i = 0; i < text.length; i++) {
                        var glyph = this.getGlyph(customFont, text, i);
                        measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm, "undefined" == typeof dx[i] || isNaN(dx[i]) || (measure += dx[i])
                    }
                    return measure
                }
                var textToMeasure = svg.compressSpaces(this.getText());
                if (!ctx.measureText) return 10 * textToMeasure.length;
                ctx.save(), this.setContext(ctx);
                var width = ctx.measureText(textToMeasure).width;
                return ctx.restore(), width
            }
        }, svg.Element.TextElementBase.prototype = new svg.Element.RenderedElementBase, svg.Element.tspan = function(node) {
            this.captureTextNodes = !0, this.base = svg.Element.TextElementBase, this.base(node), this.text = node.nodeValue || node.text || "", this.getText = function() {
                return this.text
            }
        }, svg.Element.tspan.prototype = new svg.Element.TextElementBase, svg.Element.tref = function(node) {
            this.base = svg.Element.TextElementBase, this.base(node), this.getText = function() {
                var element = this.getHrefAttribute().getDefinition();
                return null != element ? element.children[0].getText() : void 0
            }
        }, svg.Element.tref.prototype = new svg.Element.TextElementBase, svg.Element.a = function(node) {
            this.base = svg.Element.TextElementBase, this.base(node), this.hasText = !0;
            for (var i = 0; i < node.childNodes.length; i++) 3 != node.childNodes[i].nodeType && (this.hasText = !1);
            this.text = this.hasText ? node.childNodes[0].nodeValue : "", this.getText = function() {
                return this.text
            }, this.baseRenderChildren = this.renderChildren, this.renderChildren = function(ctx) {
                if (this.hasText) {
                    this.baseRenderChildren(ctx);
                    var fontSize = new svg.Property("fontSize", svg.Font.Parse(svg.ctx.font).fontSize);
                    svg.Mouse.checkBoundingBox(this, new svg.BoundingBox(this.x, this.y - fontSize.toPixels("y"), this.x + this.measureText(ctx), this.y))
                } else {
                    var g = new svg.Element.g;
                    g.children = this.children, g.parent = this, g.render(ctx)
                }
            }, this.onclick = function() {
                window.open(this.getHrefAttribute().value)
            }, this.onmousemove = function() {
                svg.ctx.canvas.style.cursor = "pointer"
            }
        }, svg.Element.a.prototype = new svg.Element.TextElementBase, svg.Element.image = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node);
            var href = this.getHrefAttribute().value,
                isSvg = href.match(/\.svg$/);
            if (svg.Images.push(this), this.loaded = !1, isSvg) this.img = svg.ajax(href), this.loaded = !0;
            else {
                this.img = document.createElement("img");
                var self = this;
                this.img.onload = function() {
                    self.loaded = !0
                }, this.img.onerror = function() {
                    "undefined" != typeof console && (console.log('ERROR: image "' + href + '" not found'), self.loaded = !0)
                }, this.img.src = href
            }
            this.renderChildren = function(ctx) {
                var x = this.attribute("x").toPixels("x"),
                    y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"),
                    height = this.attribute("height").toPixels("y");
                0 != width && 0 != height && (ctx.save(), isSvg ? ctx.drawSvg(this.img, x, y, width, height) : (ctx.translate(x, y), svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, width, this.img.width, height, this.img.height, 0, 0), ctx.drawImage(this.img, 0, 0)), ctx.restore())
            }, this.getBoundingBox = function() {
                var x = this.attribute("x").toPixels("x"),
                    y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"),
                    height = this.attribute("height").toPixels("y");
                return new svg.BoundingBox(x, y, x + width, y + height)
            }
        }, svg.Element.image.prototype = new svg.Element.RenderedElementBase, svg.Element.g = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.getBoundingBox = function() {
                for (var bb = new svg.BoundingBox, i = 0; i < this.children.length; i++) bb.addBoundingBox(this.children[i].getBoundingBox());
                return bb
            }
        }, svg.Element.g.prototype = new svg.Element.RenderedElementBase, svg.Element.symbol = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.baseSetContext = this.setContext, this.setContext = function(ctx) {
                if (this.baseSetContext(ctx), this.attribute("viewBox").hasValue()) {
                    var viewBox = svg.ToNumberArray(this.attribute("viewBox").value),
                        minX = viewBox[0],
                        minY = viewBox[1];
                    width = viewBox[2], height = viewBox[3], svg.AspectRatio(ctx, this.attribute("preserveAspectRatio").value, this.attribute("width").toPixels("x"), width, this.attribute("height").toPixels("y"), height, minX, minY), svg.ViewPort.SetCurrent(viewBox[2], viewBox[3])
                }
            }
        }, svg.Element.symbol.prototype = new svg.Element.RenderedElementBase, svg.Element.style = function(node) {
            this.base = svg.Element.ElementBase, this.base(node);
            for (var css = "", i = 0; i < node.childNodes.length; i++) css += node.childNodes[i].nodeValue;
            css = css.replace(/(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, ""), css = svg.compressSpaces(css);
            for (var cssDefs = css.split("}"), i = 0; i < cssDefs.length; i++)
                if ("" != svg.trim(cssDefs[i]))
                    for (var cssDef = cssDefs[i].split("{"), cssClasses = cssDef[0].split(","), cssProps = cssDef[1].split(";"), j = 0; j < cssClasses.length; j++) {
                        var cssClass = svg.trim(cssClasses[j]);
                        if ("" != cssClass) {
                            for (var props = {}, k = 0; k < cssProps.length; k++) {
                                var prop = cssProps[k].indexOf(":"),
                                    name = cssProps[k].substr(0, prop),
                                    value = cssProps[k].substr(prop + 1, cssProps[k].length - prop);
                                null != name && null != value && (props[svg.trim(name)] = new svg.Property(svg.trim(name), svg.trim(value)))
                            }
                            if (svg.Styles[cssClass] = props, "@font-face" == cssClass)
                                for (var fontFamily = props["font-family"].value.replace(/"/g, ""), srcs = props.src.value.split(","), s = 0; s < srcs.length; s++)
                                    if (srcs[s].indexOf('format("svg")') > 0)
                                        for (var urlStart = srcs[s].indexOf("url"), urlEnd = srcs[s].indexOf(")", urlStart), url = srcs[s].substr(urlStart + 5, urlEnd - urlStart - 6), doc = svg.parseXml(svg.ajax(url)), fonts = doc.getElementsByTagName("font"), f = 0; f < fonts.length; f++) {
                                            var font = svg.CreateElement(fonts[f]);
                                            svg.Definitions[fontFamily] = font
                                        }
                        }
                    }
        }, svg.Element.style.prototype = new svg.Element.ElementBase, svg.Element.use = function(node) {
            this.base = svg.Element.RenderedElementBase, this.base(node), this.baseSetContext = this.setContext, this.setContext = function(ctx) {
                this.baseSetContext(ctx), this.attribute("x").hasValue() && ctx.translate(this.attribute("x").toPixels("x"), 0), this.attribute("y").hasValue() && ctx.translate(0, this.attribute("y").toPixels("y"))
            }, this.getDefinition = function() {
                var element = this.getHrefAttribute().getDefinition();
                return this.attribute("width").hasValue() && (element.attribute("width", !0).value = this.attribute("width").value), this.attribute("height").hasValue() && (element.attribute("height", !0).value = this.attribute("height").value), element
            }, this.path = function(ctx) {
                var element = this.getDefinition();
                null != element && element.path(ctx)
            }, this.getBoundingBox = function() {
                var element = this.getDefinition();
                return null != element ? element.getBoundingBox() : void 0
            }, this.renderChildren = function(ctx) {
                var element = this.getDefinition();
                if (null != element) {
                    var oldParent = element.parent;
                    element.parent = null, element.render(ctx), element.parent = oldParent
                }
            }
        }, svg.Element.use.prototype = new svg.Element.RenderedElementBase, svg.Element.mask = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function(ctx, element) {
                var x = this.attribute("x").toPixels("x"),
                    y = this.attribute("y").toPixels("y"),
                    width = this.attribute("width").toPixels("x"),
                    height = this.attribute("height").toPixels("y");
                if (0 == width && 0 == height) {
                    for (var bb = new svg.BoundingBox, i = 0; i < this.children.length; i++) bb.addBoundingBox(this.children[i].getBoundingBox());
                    var x = Math.floor(bb.x1),
                        y = Math.floor(bb.y1),
                        width = Math.floor(bb.width()),
                        height = Math.floor(bb.height())
                }
                var mask = element.attribute("mask").value;
                element.attribute("mask").value = "";
                var cMask = document.createElement("canvas");
                cMask.width = x + width, cMask.height = y + height;
                var maskCtx = cMask.getContext("2d");
                this.renderChildren(maskCtx);
                var c = document.createElement("canvas");
                c.width = x + width, c.height = y + height;
                var tempCtx = c.getContext("2d");
                element.render(tempCtx), tempCtx.globalCompositeOperation = "destination-in", tempCtx.fillStyle = maskCtx.createPattern(cMask, "no-repeat"), tempCtx.fillRect(0, 0, x + width, y + height), ctx.fillStyle = tempCtx.createPattern(c, "no-repeat"), ctx.fillRect(0, 0, x + width, y + height), element.attribute("mask").value = mask
            }, this.render = function() {}
        }, svg.Element.mask.prototype = new svg.Element.ElementBase, svg.Element.clipPath = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function(ctx) {
                for (var i = 0; i < this.children.length; i++) {
                    var child = this.children[i];
                    if ("undefined" != typeof child.path) {
                        var transform = null;
                        child.attribute("transform").hasValue() && (transform = new svg.Transform(child.attribute("transform").value), transform.apply(ctx)), child.path(ctx), ctx.clip(), transform && transform.unapply(ctx)
                    }
                }
            }, this.render = function() {}
        }, svg.Element.clipPath.prototype = new svg.Element.ElementBase, svg.Element.filter = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function(ctx, element) {
                var bb = element.getBoundingBox(),
                    x = Math.floor(bb.x1),
                    y = Math.floor(bb.y1),
                    width = Math.floor(bb.width()),
                    height = Math.floor(bb.height()),
                    filter = element.style("filter").value;
                element.style("filter").value = "";
                for (var px = 0, py = 0, i = 0; i < this.children.length; i++) {
                    var efd = this.children[i].extraFilterDistance || 0;
                    px = Math.max(px, efd), py = Math.max(py, efd)
                }
                var c = document.createElement("canvas");
                c.width = width + 2 * px, c.height = height + 2 * py;
                var tempCtx = c.getContext("2d");
                tempCtx.translate(-x + px, -y + py), element.render(tempCtx);
                for (var i = 0; i < this.children.length; i++) this.children[i].apply(tempCtx, 0, 0, width + 2 * px, height + 2 * py);
                ctx.drawImage(c, 0, 0, width + 2 * px, height + 2 * py, x - px, y - py, width + 2 * px, height + 2 * py), element.style("filter", !0).value = filter
            }, this.render = function() {}
        }, svg.Element.filter.prototype = new svg.Element.ElementBase, svg.Element.feMorphology = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.apply = function() {}
        }, svg.Element.feMorphology.prototype = new svg.Element.ElementBase, svg.Element.feColorMatrix = function(node) {
            function imGet(img, x, y, width, height, rgba) {
                return img[y * width * 4 + 4 * x + rgba]
            }

            function imSet(img, x, y, width, height, rgba, val) {
                img[y * width * 4 + 4 * x + rgba] = val
            }

            this.base = svg.Element.ElementBase, this.base(node), this.apply = function(ctx, x, y, width, height) {
                for (var srcData = ctx.getImageData(0, 0, width, height), y = 0; height > y; y++)
                    for (var x = 0; width > x; x++) {
                        var r = imGet(srcData.data, x, y, width, height, 0),
                            g = imGet(srcData.data, x, y, width, height, 1),
                            b = imGet(srcData.data, x, y, width, height, 2),
                            gray = (r + g + b) / 3;
                        imSet(srcData.data, x, y, width, height, 0, gray), imSet(srcData.data, x, y, width, height, 1, gray), imSet(srcData.data, x, y, width, height, 2, gray)
                    }
                ctx.clearRect(0, 0, width, height), ctx.putImageData(srcData, 0, 0)
            }
        }, svg.Element.feColorMatrix.prototype = new svg.Element.ElementBase, svg.Element.feGaussianBlur = function(node) {
            this.base = svg.Element.ElementBase, this.base(node), this.blurRadius = Math.floor(this.attribute("stdDeviation").numValue()), this.extraFilterDistance = this.blurRadius, this.apply = function(ctx, x, y, width, height) {
                return "undefined" == typeof stackBlurCanvasRGBA ? void("undefined" != typeof console && console.log("ERROR: StackBlur.js must be included for blur to work")) : (ctx.canvas.id = svg.UniqueId(), ctx.canvas.style.display = "none", document.body.appendChild(ctx.canvas), stackBlurCanvasRGBA(ctx.canvas.id, x, y, width, height, this.blurRadius), void document.body.removeChild(ctx.canvas))
            }
        }, svg.Element.feGaussianBlur.prototype = new svg.Element.ElementBase, svg.Element.title = function() {}, svg.Element.title.prototype = new svg.Element.ElementBase, svg.Element.desc = function() {}, svg.Element.desc.prototype = new svg.Element.ElementBase, svg.Element.MISSING = function(node) {
            "undefined" != typeof console && console.log("ERROR: Element '" + node.nodeName + "' not yet implemented.")
        }, svg.Element.MISSING.prototype = new svg.Element.ElementBase, svg.CreateElement = function(node) {
            var className = node.nodeName.replace(/^[^:]+:/, "");
            className = className.replace(/\-/g, "");
            var e = null;
            return e = "undefined" != typeof svg.Element[className] ? new svg.Element[className](node) : new svg.Element.MISSING(node), e.type = node.nodeName, e
        }, svg.load = function(ctx, url) {
            svg.loadXml(ctx, svg.ajax(url))
        }, svg.loadXml = function(ctx, xml) {
            svg.loadXmlDoc(ctx, svg.parseXml(xml))
        }, svg.loadXmlDoc = function(ctx, dom) {
            svg.init(ctx);
            var mapXY = function(p) {
                for (var e = ctx.canvas; e;) p.x -= e.offsetLeft, p.y -= e.offsetTop, e = e.offsetParent;
                return window.scrollX && (p.x += window.scrollX), window.scrollY && (p.y += window.scrollY), p
            };
            1 != svg.opts.ignoreMouse && (ctx.canvas.onclick = function(e) {
                var p = mapXY(new svg.Point(null != e ? e.clientX : event.clientX, null != e ? e.clientY : event.clientY));
                svg.Mouse.onclick(p.x, p.y)
            }, ctx.canvas.onmousemove = function(e) {
                var p = mapXY(new svg.Point(null != e ? e.clientX : event.clientX, null != e ? e.clientY : event.clientY));
                svg.Mouse.onmousemove(p.x, p.y)
            });
            var e = svg.CreateElement(dom.documentElement);
            e.root = !0;
            var isFirstRender = !0,
                draw = function() {
                    svg.ViewPort.Clear(), ctx.canvas.parentNode && svg.ViewPort.SetCurrent(ctx.canvas.parentNode.clientWidth, ctx.canvas.parentNode.clientHeight), 1 != svg.opts.ignoreDimensions && (e.style("width").hasValue() && (ctx.canvas.width = e.style("width").toPixels("x"), ctx.canvas.style.width = ctx.canvas.width + "px"), e.style("height").hasValue() && (ctx.canvas.height = e.style("height").toPixels("y"), ctx.canvas.style.height = ctx.canvas.height + "px"));
                    var cWidth = ctx.canvas.clientWidth || ctx.canvas.width,
                        cHeight = ctx.canvas.clientHeight || ctx.canvas.height;
                    if (1 == svg.opts.ignoreDimensions && e.style("width").hasValue() && e.style("height").hasValue() && (cWidth = e.style("width").toPixels("x"), cHeight = e.style("height").toPixels("y")), svg.ViewPort.SetCurrent(cWidth, cHeight), null != svg.opts.offsetX && (e.attribute("x", !0).value = svg.opts.offsetX), null != svg.opts.offsetY && (e.attribute("y", !0).value = svg.opts.offsetY), null != svg.opts.scaleWidth && null != svg.opts.scaleHeight) {
                        var xRatio = 1,
                            yRatio = 1,
                            viewBox = svg.ToNumberArray(e.attribute("viewBox").value);
                        e.attribute("width").hasValue() ? xRatio = e.attribute("width").toPixels("x") / svg.opts.scaleWidth : isNaN(viewBox[2]) || (xRatio = viewBox[2] / svg.opts.scaleWidth), e.attribute("height").hasValue() ? yRatio = e.attribute("height").toPixels("y") / svg.opts.scaleHeight : isNaN(viewBox[3]) || (yRatio = viewBox[3] / svg.opts.scaleHeight), e.attribute("width", !0).value = svg.opts.scaleWidth, e.attribute("height", !0).value = svg.opts.scaleHeight, e.attribute("viewBox", !0).value = "0 0 " + cWidth * xRatio + " " + cHeight * yRatio, e.attribute("preserveAspectRatio", !0).value = "none"
                    }
                    1 != svg.opts.ignoreClear && ctx.clearRect(0, 0, cWidth, cHeight), e.render(ctx), isFirstRender && (isFirstRender = !1, "function" == typeof svg.opts.renderCallback && svg.opts.renderCallback(dom))
                },
                waitingForImages = !0;
            svg.ImagesLoaded() && (waitingForImages = !1, draw()), svg.intervalID = setInterval(function() {
                var needUpdate = !1;
                if (waitingForImages && svg.ImagesLoaded() && (waitingForImages = !1, needUpdate = !0), 1 != svg.opts.ignoreMouse && (needUpdate |= svg.Mouse.hasEvents()), 1 != svg.opts.ignoreAnimation)
                    for (var i = 0; i < svg.Animations.length; i++) needUpdate |= svg.Animations[i].update(1e3 / svg.FRAMERATE);
                "function" == typeof svg.opts.forceRedraw && 1 == svg.opts.forceRedraw() && (needUpdate = !0), needUpdate && (draw(), svg.Mouse.runEvents())
            }, 1e3 / svg.FRAMERATE)
        }, svg.stop = function() {
            svg.intervalID && clearInterval(svg.intervalID)
        }, svg.Mouse = new function() {
            this.events = [], this.hasEvents = function() {
                return 0 != this.events.length
            }, this.onclick = function(x, y) {
                this.events.push({
                    type: "onclick",
                    x: x,
                    y: y,
                    run: function(e) {
                        e.onclick && e.onclick()
                    }
                })
            }, this.onmousemove = function(x, y) {
                this.events.push({
                    type: "onmousemove",
                    x: x,
                    y: y,
                    run: function(e) {
                        e.onmousemove && e.onmousemove()
                    }
                })
            }, this.eventElements = [], this.checkPath = function(element, ctx) {
                for (var i = 0; i < this.events.length; i++) {
                    var e = this.events[i];
                    ctx.isPointInPath && ctx.isPointInPath(e.x, e.y) && (this.eventElements[i] = element)
                }
            }, this.checkBoundingBox = function(element, bb) {
                for (var i = 0; i < this.events.length; i++) {
                    var e = this.events[i];
                    bb.isPointInBox(e.x, e.y) && (this.eventElements[i] = element)
                }
            }, this.runEvents = function() {
                svg.ctx.canvas.style.cursor = "";
                for (var i = 0; i < this.events.length; i++)
                    for (var e = this.events[i], element = this.eventElements[i]; element;) e.run(element), element = element.parent;
                this.events = [], this.eventElements = []
            }
        }, svg
    }

    this.canvg = function(target, s, opts) {
        if (null != target || null != s || null != opts) {
            opts = opts || {}, "string" == typeof target && (target = document.getElementById(target)), null != target.svg && target.svg.stop();
            var svg = build();
            (1 != target.childNodes.length || "OBJECT" != target.childNodes[0].nodeName) && (target.svg = svg), svg.opts = opts;
            var ctx = target.getContext("2d");
            "undefined" != typeof s.documentElement ? svg.loadXmlDoc(ctx, s) : "<" == s.substr(0, 1) ? svg.loadXml(ctx, s) : svg.load(ctx, s)
        } else
            for (var svgTags = document.getElementsByTagName("svg"), i = 0; i < svgTags.length; i++) {
                var svgTag = svgTags[i],
                    c = document.createElement("canvas");
                c.width = svgTag.clientWidth, c.height = svgTag.clientHeight, svgTag.parentNode.insertBefore(c, svgTag), svgTag.parentNode.removeChild(svgTag);
                var div = document.createElement("div");
                div.appendChild(svgTag), canvg(c, div.innerHTML)
            }
    }
}(), "undefined" != typeof CanvasRenderingContext2D && (CanvasRenderingContext2D.prototype.drawSvg = function(s, dx, dy, dw, dh) {
    canvg(this.canvas, s, {
        ignoreMouse: !0,
        ignoreAnimation: !0,
        ignoreDimensions: !0,
        ignoreClear: !0,
        offsetX: dx,
        offsetY: dy,
        scaleWidth: dw,
        scaleHeight: dh
    })
});