// TODO: rename type name
type Nodea = {
    name: string;
    totalSales: number;
    genPath: string; // Generation path indicating node hierarchy
  };
  
  type CalculatedNode = {
    name: string;
    totalSales: number;
    calculatedFinalSales: number;
    genPath: string;
    genPathInArray: string[];
  };
  
  const salesData: Nodea[] = [
    { name: 'YOU', totalSales: 0, genPath: '1' },
    { name: 'A1', totalSales: 138000, genPath: '1.1' },
    { name: 'A2', totalSales: 276000, genPath: '1.1.2' },
    { name: 'A3', totalSales: 138000, genPath: '1.1.2.3' },
    { name: 'A4', totalSales: 414000, genPath: '1.1.2.4' },
    { name: 'A5', totalSales: 276000, genPath: '1.1.2.5' },
    { name: 'A6', totalSales: 138000, genPath: '1.1.2.3.6' },
    { name: 'A7', totalSales: 138000, genPath: '1.1.2.4.7' },
    { name: 'A8', totalSales: 138000, genPath: '1.1.2.5.8' },
    { name: 'A9', totalSales: 414000, genPath: '1.1.2.5.9' },
    { name: 'A10', totalSales: 138000, genPath: '1.1.2.4.7.10' },
    { name: 'A11', totalSales: 414000, genPath: '1.1.2.4.7.11' },
    { name: 'A12', totalSales: 138000, genPath: '1.1.2.4.7.10.12' },
    { name: 'A13', totalSales: 276000, genPath: '1.1.2.4.7.10.12.13' },
    { name: 'A14', totalSales: 414000, genPath: '1.1.2.4.7.10.12.13.14' },
    { name: 'B1', totalSales: 0, genPath: '1.2' },
    { name: 'B2', totalSales: 414000, genPath: '1.2.1' },
    { name: 'B3', totalSales: 138000, genPath: '1.2.3' },
    { name: 'C1', totalSales: 414000, genPath: '1.3' },
    { name: 'C2', totalSales: 138000, genPath: '1.3.1' },
    { name: 'C3', totalSales: 276000, genPath: '1.3.2' },
    { name: 'C4', totalSales: 414000, genPath: '1.3.3' },
  ];
  
  const MINIMUM_SALES_TARGET = 387000;
  const CREATE_VIRTUAL_NODE_MIN_AMOUNT = 774000;
  const VIRTUAL_NODE_MAX_AMOUNT = 414000;
  const NODE_MAX_AMOUNT_AFTER_CREATE_VIRTUAL_NODE = 387000;
  
  const contructGenealogyTree = (salesData: Nodea[]): CalculatedNode[] => {
    let maxLayer: number = 0; // the longest length / level of genPath
    const newCreatedVirtualNodes: CalculatedNode[] = [];
  
    // init calculatedNode for later calculation
    const calculatedSalesData: CalculatedNode[] = salesData.map((saleData) => {
      const genPathInArray: string[] = saleData.genPath.split('.');
      if (maxLayer < genPathInArray.length) maxLayer = genPathInArray.length;
      return {
        ...saleData,
        calculatedFinalSales: 0,
        genPathInArray,
      };
    });
  
    const getNodeLayerByGenPathInArray = (n: CalculatedNode): number => {
      return n.genPathInArray.length;
    }
  
    const checkNodeIsChildOfNode = (childNode: CalculatedNode, parentNode: CalculatedNode): boolean => {
      return (
        childNode.genPath.substring(0, parentNode.genPath.length) === parentNode.genPath &&
        childNode.genPathInArray.length - 1 === parentNode.genPathInArray.length
      );
    }
  
    const getChildrenOfNode = (n: CalculatedNode): CalculatedNode[] => {
      const childrenOfNode = calculatedSalesData.filter((c: CalculatedNode) => checkNodeIsChildOfNode(c, n));
      return childrenOfNode;
    }
  
    for (let currentLayer = maxLayer; currentLayer > 0; currentLayer--) { // start from bottom to top
      for (let i = 0; i < calculatedSalesData.length; i++) {
        if (getNodeLayerByGenPathInArray(calculatedSalesData[i]) != currentLayer) {
          continue;
        }
  
        // === process node calculation ===
        // Note: base on my understanding, process from bottom to top, after processed, the amount will not change already
        calculatedSalesData[i].calculatedFinalSales = calculatedSalesData[i].calculatedFinalSales + calculatedSalesData[i].totalSales;
  
        //  ex: if get borrow from parent, the processed result will still same
        // if node total sales less than 387000, borrow from child
        // -- borrow all amount of child
        // -- borrow from child who can let him reach target with minumum borrowed amount
        if (calculatedSalesData[i].calculatedFinalSales < MINIMUM_SALES_TARGET) {
          const nodeChildren = getChildrenOfNode(calculatedSalesData[i]);
          if (nodeChildren.length > 0) {
            // find suitable child to borrow
            let childToBorrow: CalculatedNode | null = null;
            for (let j = 0; j < nodeChildren.length; j++) {
              // TODO: maybe need to change this 'select child to borrow' logic
              // Note: if child has passed all amount, then can't borrow anymore
              const isChildPassedAllAmount = nodeChildren[j].calculatedFinalSales < MINIMUM_SALES_TARGET;
              if (isChildPassedAllAmount) {
                continue;
              }
              if (
                !childToBorrow &&
                nodeChildren[j].calculatedFinalSales + calculatedSalesData[i].calculatedFinalSales >= MINIMUM_SALES_TARGET
              ) {
                childToBorrow = nodeChildren[j];
                continue;
              }
              if (
                childToBorrow &&
                nodeChildren[j].calculatedFinalSales + calculatedSalesData[i].calculatedFinalSales >= MINIMUM_SALES_TARGET &&
                nodeChildren[j].calculatedFinalSales < childToBorrow.calculatedFinalSales
              ) {
                childToBorrow = nodeChildren[j];
              }
            }
  
            if (childToBorrow) {
              // Note: assume after borrow, child's amount remain the same
              calculatedSalesData[i].calculatedFinalSales = calculatedSalesData[i].calculatedFinalSales + childToBorrow.calculatedFinalSales;
            }
  
          }
        }
  
        // if total sales > 774000, create virtual node up to 414000 max, retain how much left
        // -- if > 828000, create virtual node with 414000 and retain 387000 (max)
        if (calculatedSalesData[i].calculatedFinalSales > CREATE_VIRTUAL_NODE_MIN_AMOUNT) {
          const virtualNodeAmount = VIRTUAL_NODE_MAX_AMOUNT;
          const retainAmount = calculatedSalesData[i].calculatedFinalSales - VIRTUAL_NODE_MAX_AMOUNT;
  
          const newVirtualNode: CalculatedNode = {
            name: `VN of ${calculatedSalesData[i].name}`,
            totalSales: calculatedSalesData[i].totalSales,
            calculatedFinalSales: virtualNodeAmount,
            genPath: `${calculatedSalesData[i].genPath}.vn`, // assume 'vn' is the genpath of virtual node
            genPathInArray: [...calculatedSalesData[i].genPathInArray, 'vn']
          };
          newCreatedVirtualNodes.push(newVirtualNode);
  
          // update
          calculatedSalesData[i].calculatedFinalSales = (retainAmount > NODE_MAX_AMOUNT_AFTER_CREATE_VIRTUAL_NODE) ?
            NODE_MAX_AMOUNT_AFTER_CREATE_VIRTUAL_NODE : retainAmount;
        }
  
        // if still not reach 387000, pass all amount to parent
        if (calculatedSalesData[i].calculatedFinalSales < MINIMUM_SALES_TARGET) {
          const parentGenPathInArray = calculatedSalesData[i].genPath.split('.');
          parentGenPathInArray.pop();
          const parentGenPath = parentGenPathInArray.join('.');
          const parentNode = calculatedSalesData.find((d) => d.genPath === parentGenPath);
          if (parentNode) {
            // assume pass all amount to parent, but for display purpose no change he current node amount
            // TODO: check whether parentNode amount updated?
            parentNode.calculatedFinalSales = parentNode.calculatedFinalSales + calculatedSalesData[i].calculatedFinalSales;
          }
        }
      }
    }
  
    return calculatedSalesData.concat(newCreatedVirtualNodes);
  };
  
  const calculateBonus = (calculatedSalesData: CalculatedNode) => {
      
  };
  
  const result = contructGenealogyTree(salesData);
  console.log('result: ', result);