const getOffsetParent = (node, parent) => {
  const out = {
    left: 0,
    top: 0,
    width: node.offsetWidth,
    height: node.offsetHeight,
  };

  while(parent.contains(node.offsetParent)) {
    out.top += node.offsetTop;
    out.left += node.offsetLeft;
    node = node.offsetParent;
  }

  return out;
};

export default getOffsetParent;
