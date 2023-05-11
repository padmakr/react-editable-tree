import { data } from "./data";

import { Button, Input, Tree } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.css";
const { Search } = Input;
const dataList = [];
const keysList = [];
const generateList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key, title, form, aggregates } = node;
    dataList.push({ key, title, form, aggregates });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(data);

const generateKeysList = (data) => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const { key } = node;

    keysList.push(key);
    if (node.children) {
      generateKeysList(node.children);
    }
  }
};
generateKeysList(data);
const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};
const getNodeDetails = (key, tree) => {
  let nodeDetails;
  let found = false;
  if (!found && tree) {
    if (tree.key === key) {
      nodeDetails = tree;
      found = true;
    } else {
      for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.key === key) {
          nodeDetails = node;
          found = true;
          break;
        } else if (getNodeDetails(key, node.children)) {
          nodeDetails = getNodeDetails(key, node.children);
        }
      }
    }
  }
  return nodeDetails;
};
const AntTree = () => {
  const [treeData, setTreeData] = useState(data);
  const [, setSearchValue] = useState("");
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [, setSelectNodeKey] = useState("");
  const [selectNodeDetails, setSelectNodeDetails] = useState({});
  const onExpand = (newExpandedKeys) => {
    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(false);
  };
  const onExpandAll = () => {
    setExpandedKeys(keysList);
  };
  const onCollapseAll = () => {
    setExpandedKeys([]);
  };

  const deleteClick = (filterKey) => {
    setTreeData(deleteNode(treeData, filterKey?.key));
  };

  const addClick = (data) => {
    const addChildToNode = (node, child) => {
      return {
        ...node,
        children: [...node.children, child],
      };
    };
    const updateTreeData = (treeData, nodeId, newChild) => {
      return treeData.map((node) => {
        if (node?.key === nodeId) {
          return addChildToNode(node, newChild);
        } else if (node?.children) {
          return {
            ...node,
            children: updateTreeData(node?.children, nodeId, newChild),
          };
        } else {
          return node;
        }
      });
    };
    const newChild = {
      key: `${data?.key}-child`,
      title: `${data?.key}-child-title`,
      children: [],
    };
    const updatedData = updateTreeData(treeData, data?.key, newChild);
    setTreeData(updatedData);
  };
  const onSelect = (selectedKeys, info) => {
    const node = getNodeDetails(selectedKeys[0], data);
    setSelectNodeKey(selectedKeys[0]);
    setSelectNodeDetails(node);
  };
  const onChange = (e) => {
    const { value } = e.target;
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, data);
        }
        return null;
      })
      .filter((item, i, self) => item && self.indexOf(item) === i);
    setExpandedKeys(newExpandedKeys);
    setSearchValue(value);
    setAutoExpandParent(true);
  };
  const nodeRender = (nodeData) => {
    const AddButton = () => {
      return (
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => {
            addClick(nodeData);
          }}
        />
      );
    };
    const DeleteButton = () => {
      return (
        <Button
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => {
            deleteClick(nodeData);
          }}
        />
      );
    };
    return (
      <div>
        <Input
          addonAfter={
            <>
              <AddButton />
              <DeleteButton />
            </>
          }
          defaultValue={nodeData.title}
        />
      </div>
    );
  };

  const deleteNode = (tree, id) => {
    return tree.filter((node) => {
      if (node.key === id) {
        return false;
      }
      if (node.children) {
        node.children = deleteNode(node.children, id);
      }
      return true;
    });
  };

  return (
    <div className="grid-container">
      <div className="treeClass">
        <br />
        <div>
          <Button onClick={onExpandAll}>Expand All</Button>
          <Button onClick={onCollapseAll}>Collapse All</Button>
          <Search
            style={{ marginBottom: 8, width: "50%" }}
            placeholder="Search"
            onChange={onChange}
          />
        </div>
        <br />
        <div>
          <Tree
            treeData={treeData}
            showLine={true}
            onExpand={onExpand}
            expandedKeys={expandedKeys}
            autoExpandParent={autoExpandParent}
            onSelect={onSelect}
            titleRender={(nodeData) => nodeRender(nodeData)}
          />
        </div>
      </div>
    </div>
  );
};
export default AntTree;
