import React, { useEffect, useState } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import { contractAddresses, abi } from "../constants";
import { ethers } from "ethers";
import { Loading, useNotification } from "web3uikit";

export default function EnterLottery() {
  const [entranceFee, setEntranceFee] = useState();
  const [loading, setLoading] = useState(false);
  const [enterBtnLoading, setEnterBtnLoading] = useState(false);
  const [findBtnLoading, setFindBtnLoading] = useState(false);
  const [claimBtnLoading, setClaimBtnLoading] = useState(false);
  const [players, setPlayers] = useState([]);
  const [listWinner, setListWinner] = useState([]);
  const [pot, setPot] = useState();
  const [isClaim, setIsClaim] = useState();
  const [recentWinner, setRecentWinner] = useState()
  const [openLog, setOpenLog] = useState(false)

  const { chainId: chainIdHex, isWeb3Enabled,account } = useMoralis();

  const dispatch = useNotification();

  const lotteryAddress = "0xdD5eC281132c692e147E4d7FBddbFF198d68C34b"

  const {runContractFunction: getPlayers} = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getPlayers",
    params: {},
  })

  const {runContractFunction: getHistoryWinner} = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getHistoryWinner",
    params: {},
  })

  const {runContractFunction: getPot} = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getPot",
    params: {}
  })

  const { runContractFunction: enterLottery } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "enterLottery",
    params: {},
    msgValue: entranceFee,
  });

  const {
    runContractFunction: getEntranceFee,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getEntranceFee",
    params: {},
  });

  const {runContractFunction: getRecentWinner} = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "getRecentWinner"
  })

  const {runContractFunction: claim} = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "claim",
    params: {},
  })

  const {runContractFunction: findLuckyUser} = useWeb3Contract({
    abi,
    contractAddress: lotteryAddress,
    functionName: "findLuckyUser",
    params: {}
  })

  const handleClick = async () => {
    setEnterBtnLoading(true);
    const trans = await enterLottery({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    });
    await trans?.wait();
    const number  = await getPlayers();
    const money = await getPot();
    setPot(money);
    setPlayers(number);
  };

  const handleLuckyUser = async() => {
    setFindBtnLoading(true);
   const trans =  await findLuckyUser();
    await trans?.wait(6);
    const winners = await getHistoryWinner();
    const recentWinner = await getRecentWinner();
    setListWinner(winners);
    setRecentWinner(recentWinner)
    setOpenLog(true)
  }


  const handleClaim = async() => {
     setClaimBtnLoading(true);
    const trans = await claim({
      onSuccess: handleSuccess,
      onError: (error) => console.log(error),
    })
    await trans?.wait();
    const number  = await getPlayers();
    setPlayers(number);
  }

  // Notifications
  const handleSuccess = async (tx) => {
    await tx.wait(1);
    handleNewNotification(tx);
    setEnterBtnLoading(false);
    setClaimBtnLoading(false);
    // getAll()
  };

  const handleNewNotification = () => {
    dispatch({
      type: "info",
      message: "Transaction Completed Successfully",
      title: "Transaction Notification",
      position: "topR",
      icon: "bell",
    });
  };
const checkClaim = () => {
 for (let i = 0; i < listWinner?.length; i ++) {
  if (listWinner[i] == account) {
    return false; // flase thi moi khong claim duoc
  }
 }
}

  useEffect(() => {
    if (isWeb3Enabled) {
      const getAll = async () => {
        const getFee = (await getEntranceFee());
        const players = await getPlayers();
        const pot = await getPot();
        const listWinners = await getHistoryWinner();
        setListWinner(listWinners);
        setPot(pot?.toString());
        setPlayers(players)
        setEntranceFee(getFee);
        setFindBtnLoading(false)

      };
      getAll();
      const isClaim = checkClaim();
      setIsClaim(isClaim);
      
    }
  }, [isWeb3Enabled, players?.length, listWinner?.length]);

  const offLog = () => {
    setOpenLog(false)
  }

  return (
   <div className="relative" >
     <div className="px-10 py-5">
      {lotteryAddress ? (
      <div className="flex">
        <div className="flex-[0.5]" >
          <div className="space-y-5">
          <p className=" text-[32px] text-blue-500 font-bold text-center space-x-5">
            Entrance Fee =
            <span className="text-green-500 px-5">
              {entranceFee && ethers.utils.formatUnits(entranceFee, "ether")} Ether
            </span>
          </p>
          <p className=" text-[32px] text-blue-500 font-bold text-center space-x-5" >Pot = 
            <span className="text-green-500 px-5">
              {String(pot)}
            </span>
          </p>        
            
          <div className="text-center">
            <button
              className="cursor-pointer mt-12 w-40 h-10 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={isFetching || isLoading || loading || enterBtnLoading}
              onClick={handleClick}
            >
              {enterBtnLoading || isLoading || isFetching ? (
                <div>
                  <Loading fontSize={20} direction="right" spinnerType="wave" />
                </div>
              ) : (
                <div>Enter Lottery</div>
              )}
            </button>

                <br />
            <button
              className="cursor-pointer mt-12 w-40 h-10 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={isFetching || isLoading || loading || findBtnLoading}
              onClick={handleLuckyUser}
            >
              {findBtnLoading || isLoading || isFetching ? (
                <div>
                  <Loading fontSize={20} direction="right" spinnerType="wave" />
                </div>
              ) : (
                <div>findLuckyUser</div>
              )}
            </button>
                <br />
              <button
              className="cursor-pointer mt-12 w-40 h-10 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              disabled={isFetching || isLoading || loading || claimBtnLoading || isClaim}
              onClick={handleClaim}
            >
              {claimBtnLoading || isLoading || isFetching ? (
                <div>
                  <Loading fontSize={20} direction="right" spinnerType="wave" />
                </div>
              ) : (
                <div>claim</div>
              )}
            </button>
          </div>
        </div>
      </div>
       <div className="text-white flex-[0.5] flex flex-col items-center" >
        <div className="text-green-500 text-[32px] font-bold" >
          <div className="flex items-center" >
            <span className="mr-10" >History Winner</span>
          <img className="w-20" src="/images/award-img.png" alt="Winner" />
          </div>
          <div>
            {listWinner?.length ? [...listWinner]?.reverse().map((item, index) => {
              return(
                <p className="text-[16px] text-blue-700 mt-4"  key = {index}>
                  {item}
                </p>
              )
            }) : 
              <p className="text-[16px] text-white" >Not Found Winner</p>
            }
          </div>
        </div>
        <div >
         <span className=" text-[32px] text-blue-500 font-bold text-center">Palyer({players?.length})</span>
          {players?.map((item, index) => {

            return (
              <p key={index} className="mt-4 text-yellow-600" >
                {item.toString()}
              </p>
            )
          })}
        </div>
      </div>
      </div>
      ) : (
        <div className="text-white text-center">Wallet Not Connected (Connect Using Connect wallet Button in the top right)</div>
      )}
    </div>

   {openLog &&  <div className="absolute top-0 left-0 right-0 bottom-0" >
        <div className="absolute top-[35%] left-[38%] bg-yellow-400 w-[300px] h-[200px] rounded-xl" >
          <p className="text-center m-4 text-[24px] font-bold" >Xin chúc mừng tài khoản</p>
          <p>{recentWinner}</p>
          <div onClick={offLog} className="absolute -top-[10%] -right-[6%] text-white w-[20px] h-[20px] rounded-full border border-white flex items-center justify-center cursor-pointer" >
            <span>x</span>
          </div>
        </div>
        
      </div>}
   </div>
  );
}
