const isString = str => typeof str === "string" || str instanceof String;
const trim = str => str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, "");
const arrayize = function(arr) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (isString(arr)) {
    const obj = {};
    for (let opt of Array.from(arr.split(";"))) {
      const kv = opt.split(":");
      obj[trim(kv[0])] = trim(kv[1]);
    }
    return [obj];
  } else {
    return [arr];
  }
};

const isOpened2 = function() {
  return {
    props: {
      isOpened: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        opened: null
      };
    },
    methods: {
      setOpened() {
        this.opened = true;
        return this.$emit("toggled", true);
      },
      setClosed() {
        this.opened = false;
        return this.$emit("toggled", false);
      }
    },
    watch: {
      isOpened(val) {
        if (val !== this.opened) {
          return this.toggle();
        }
      }
    },
    mounted() {
      return this.$nextTick(function() {
        if (this.isOpened) {
          return this.toggle();
        }
      });
    }
  };
};

const style = function() {
  return {
    computed: {
      computedStyle() {
        const style = arrayize(this.style);
        if (this.mergeStyle == null) {
          return style;
        }
        return arrayize(this.mergeStyle).concat(style);
      }
    }
  };
};

export { isOpened2, style };
