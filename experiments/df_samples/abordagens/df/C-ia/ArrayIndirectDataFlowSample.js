function ArrayIndirectDataFlowSample() {}

ArrayIndirectDataFlowSample.main = function (args) {
    // int[] arr = {0,0,0,0,0};
    var arr = [0, 0, 0, 0, 0];

    // arr[4] = 10;        //source 1
    arr[4] = 10;

    // int b = arr[3];     //sink 1
    var b = arr[3];

    // System.out.println(b); //sink 2
    console.log(b);
};

// invoke main
ArrayIndirectDataFlowSample.main([]);
