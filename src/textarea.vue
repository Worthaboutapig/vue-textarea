<template lang="pug">
.vue-textarea(@mousedown="mousedown")
  .sizer(ref="sizer" :style="sizerStyle") {{ value }}
  textarea(
    :value="value",
    ref="ta",
    :style="taStyle",
    :autofocus="autofocus",
    :disabled="disabled",
    :readonly="readonly",
    @mouseenter="mouseenter",
    @mouseleave="mouseleave",
    @focus="onFocus",
    @blur="onBlur",
    @keyup="onKeyup",
    @input="update",
    @scroll="onScroll")
  slot(name="label")
  .placeholder(v-if="!isOpened && value==''" v-show="loaded" :style="sizerStyle")
    slot(name="placeholder")
  .content(v-if="!loaded" ref="content")
    slot
</template>

<script>
import { isOpened2, style } from "./mixins.js";

export default {
  mixins: [isOpened2(), style()],

  props: {
    autofocus: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    noExtraLine: {
      type: Boolean,
      default: false
    },
    value: {
      type: String,
      default: ""
    },
    transitionIn: {
      type: Function,
      default: () => callback()
    },
    transitionOut: {
      type: Function,
      default: () => callback()
    },
    maxSize: {
      type: Object,
      default: () => ({
        height: undefined,
        width: undefined
      })
    },
    size: {
      type: Object,
      default: () => ({
        height: undefined
      })
    },
    hoverSize: {
      type: Object,
      default: () => ({
        height: undefined
      })
    }
  },

  data() {
    return {
      content: {},
      current: {
        width: undefined,
        height: undefined
      },
      loaded: false,
      hovered: false,
      tastyle: undefined,
      elstyle: undefined
    };
  },

  computed: {
    inner() {
      const inner = {
        top: undefined,
        bottom: undefined
      };

      if (this.tastyle) {
        for (let name of ["top", "right", "bottom", "left"]) {
          const padding = parseFloat(
            this.tastyle.getPropertyValue(`padding-${name}`).replace("px", "")
          );
          const border = parseFloat(
            this.tastyle
              .getPropertyValue(`border-${name}-width`)
              .replace("px", "")
          );
          inner[name] = padding + border;
        }
      }

      return inner;
    },
    sizerStyle() {
      if (!this.tastyle || !this.elstyle) {
        return undefined;
      }

      const style = {
        fontSize: this.tastyle.getPropertyValue("font-size"),
        lineHeight: this.lineHeight + "px",
        fontFamily: this.tastyle.getPropertyValue("font-family"),
        letterSpacing: this.tastyle.getPropertyValue("letter-spacing"),
        minHeight: this.tastyle.getPropertyValue("min-height"),
        maxWidth: this.maxWidth ? this.maxWidth + "px" : undefined,
        maxHeight: this.maxHeight + "px",
        paddingTop: this.inner.top + "px",
        paddingBottom: this.inner.bottom + "px",
        paddingLeft: this.inner.left + "px",
        paddingRight: this.inner.right + "px",
        top: this.elstyle.getPropertyValue("padding-top"),
        left: this.elstyle.getPropertyValue("padding-left"),
        marginTop: this.tastyle.getPropertyValue("margin-top"),
        marginBottom: this.tastyle.getPropertyValue("margin-bottom"),
        marginLeft: this.tastyle.getPropertyValue("margin-left"),
        marginRight: this.tastyle.getPropertyValue("margin-right"),
        boxSizing: this.tastyle.getPropertyValue("box-sizing")
      };

      return style;
    },
    lineHeight() {
      if (!this.tastyle) {
        return undefined;
      }

      const lh = this.tastyle.getPropertyValue("line-height");
      return lh === "normal" ? null : parseFloat(lh.replace("px", ""));
    },
    lineHeightOrFontSize() {
      return this.lineHeight
        ? this.lineHeight
        : parseFloat(this.sizerStyle.fontSize.replace("px", ""));
    },
    maxWidth() {
      return this.maxSize.width ? this.maxSize.width : undefined;
    },
    maxHeight() {
      return this.maxSize.height ? this.maxSize.height : undefined;
    },
    closed() {
      let { height } = this.size;
      if (height == null) {
        height = this.$refs.ta.offsetHeight;
      }

      if (this.maxheight && height > this.maxheight) {
        height = this.maxheight;
      }

      let { width } = this.size;
      if (width == null) {
        width = this.$refs.ta.offsetWidth;
      }

      if (this.maxWidth && width > this.maxWidth) {
        width = this.maxWidth;
      }

      return {
        width,
        height
      };
    },
    taStyle() {
      if (!this.inner) {
        return undefined;
      }

      return {
        height: this.offsetHeight(this.current.height) + "px",
        width: this.offsetWidth(this.current.width) + "px",
        visibility: this.loaded ? null : "hidden",
        overflow: this.opened ? null : "hidden"
      };
    },
    mergeStyle() {
      if (!this.tastyle) {
        return undefined;
      }

      return {
        position: "relative",
        height: this.current.height + "px",
        width: this.maxWidth ? this.maxWidth + "px" : undefined
      };
    }
  },

  // watch: {
  //   value(newValue) {
  //     this.valueChanged(newValue);
  //   }
  // },

  mounted() {
    // if (!this.value) {
    //   this.value = this.$refs.content
    //     ? this.$refs.content.textContent
    //     : undefined;
    // }
    this.tastyle = window.getComputedStyle(this.$refs.ta);
    this.elstyle = window.getComputedStyle(this.$el);
    this.processContent();
    this.loaded = true;
    return this.isOpened
      ? this.setCurrent(this.content)
      : this.setCurrent(this.closed);
  },

  methods: {
    offsetHeight(height) {
      if (height == null) {
        ({ height } = this);
      }

      return height - this.inner.top - this.inner.bottom;
    },
    offsetWidth(width) {
      if (width == null) {
        ({ width } = this);
      }

      return width - this.inner.left - this.inner.right;
    },
    setCurrent(style) {
      this.current.height = style.height;
      return (this.current.width = style.width);
    },
    mousedown(e) {
      if (!e.defaultPrevented) {
        if (!this.opened && this.value === "") {
          e.preventDefault();
          this.focus();
        }

        return this.open();
      }
    },
    onFocus(e) {
      return this.$emit("focus", e);
    },
    onBlur(e) {
      this.close();
      return this.$emit("blur", e);
    },
    onScroll(e) {
      return this.$emit("scroll", e);
    },
    focus() {
      this.open();
      return this.$refs.ta.focus();
    },
    blur() {
      this.close();
      return this.$refs.ta.blur();
    },
    onKeyup(e) {
      return this.$emit("keyup", e);
    },
    mouseenter() {
      if (!this.opened) {
        if (
          this.hoverSize.height > this.hoverSize.height ||
          this.hoverSize.width > this.closed.width
        ) {
          this.hovered = true;
          return this.move(this.hoverSize);
        }
      }
    },
    mouseleave() {
      if (!this.opened && this.hovered) {
        return this.move(this.closed);
      }
    },
    update(event) {
      this.$emit("input", event.target.value);
      return this.processContent(event.target.value);
      // return e.stopPropagation();
    },
    processContent(content) {
      this.content.height = this.$refs.sizer.clientHeight;
      if (!this.noExtraLine) {
        this.content.height += this.lineHeightOrFontSize;
      }

      if (this.content.height < this.closed.height) {
        this.content.height = this.closed.height;
      }

      if (this.maxHeight && this.content.height > this.maxHeight) {
        this.content.height = this.maxHeight;
      }

      this.content.width = this.$refs.sizer.offsetWidth;

      if (this.content.width < this.closed.width) {
        this.content.width = this.closed.width;
      }

      if (content && this.opened) {
        return this.move(this.content);
      }
    }, // use transition

    getOffsetStyle(style) {
      return {
        height: this.offsetHeight(style.height),
        width: this.offsetWidth(style.width)
      };
    },

    move(style, callback) {
      const area = this.current.height * this.current.width;
      const newArea = style.height * style.width;
      if (area === newArea) {
        return typeof callback === "function" ? callback() : undefined;
      } else if (area <= newArea) {
        return this.transitionIn({
          el: this.$refs.ta,
          style: this.getOffsetStyle(style),
          callback: () => {
            this.setCurrent(style);
            return typeof callback === "function" ? callback() : undefined;
          }
        });
      } else {
        return this.transitionOut({
          el: this.$refs.ta,
          style: this.getOffsetStyle(style),
          callback: () => {
            this.setCurrent(style);
            return typeof callback === "function" ? callback() : undefined;
          }
        });
      }
    },

    show() {
      this.setOpened();
      this.$emit("before-enter");
      return this.move(this.content, () => this.$emit("after-enter"));
    },

    hide() {
      this.$emit("before-leave");
      return this.move(this.closed, () => {
        this.setClosed();
        return this.$emit("after-leave");
      });
    },

    open() {
      if (!this.opened) {
        return this.show();
      }
    },

    close() {
      if (this.opened) {
        return this.hide();
      }
    },

    toggle() {
      return this.opened ? this.close() : this.open();
    }
  }
};
</script>

<style lang="scss">
.vue-textarea {
  .sizer {
    position: absolute;
    visibility: hidden;
    word-break: break-word;
    white-space: pre-wrap;
    overflow: auto;
  }

  textarea {
    resize: none;
    overflow: hidden;
  }

  .content {
    position: absolute;
    visibility: hidden;
  }

  .placeholder {
    position: absolute;
    overflow: hidden;
  }
}
</style>
