import React, { useCallback, useEffect, useState } from "react";
import {
	Box,
	Button,
	Container,
	Grid,
	ListItem,
	ListItemText,
	Paper,
	TextField,
	Typography,
} from "@mui/material";
import axios from "axios";
import { PieChart } from "react-minimal-pie-chart";

const getColorTags = (txt, num) => {
	if (num < 50) return txt;
	else if (num < 70)
		return `<span style="background-color: yellow;">${txt}</span>`;
	else if (num < 85)
		return `<span style="background-color: orange;">${txt}</span>`;
	else
		return `<span style="background-color: rgb(255, 128, 128);">${txt}</span>`;
};

const getColor = (num) => {
	if (num < 50) return "white";
	else if (num < 70) return "yellow";
	else if (num < 85) return "orange";
	else return "rgb(255, 128, 128)";
};

const App = () => {
	const [doc1, setDoc1] = useState("");
	const [doc2, setDoc2] = useState("");
	const [totSim, setTotSim] = useState(null);
	const [sim, setSim] = useState([]);
	const [edit, setEdit] = useState(true);
	const [pieData, setPieData] = useState([
		{ value: 0, color: "rgb(255, 128, 128)" },
		{ value: 0, color: "orange" },
		{ value: 0, color: "yellow" },
		{ value: 0, color: "white" },
	]);

	console.log({ pieData });

	useEffect(() => {
		const func = async () => {
			const temp = pieData;
			temp[0].value = 0;
			temp[1].value = 0;
			temp[2].value = 0;
			temp[3].value = 0;

			await Promise.all(
				sim.map((item) => {
					return new Promise((resolve, reject) => {
						const len = item[0].trim().split(" ").length;

						if (item[1] < 50) temp[3].value += len;
						else if (item[1] < 70) temp[2].value += len;
						else if (item[1] < 85) temp[1].value += len;
						else temp[0].value += len;
						resolve();
					});
				})
			);
			// const sum = temp[0].value + temp[1].value + temp[2].value + temp[3].value;
			// temp[0].value = Math.round((temp[0].value / sum) * 100);
			// temp[1].value = Math.round((temp[1].value / sum) * 100);
			// temp[2].value = Math.round((temp[2].value / sum) * 100);
			// temp[3].value = Math.round((temp[3].value / sum) * 100);

			// temp[0].title = `${temp[0].value}%`;
			// temp[1].title = `${temp[1].value}%`;
			// temp[2].title = `${temp[2].value}%`;
			// temp[3].title = `${temp[3].value}%`;
			setPieData(temp);
		};
		if (sim.length > 0) func();
	}, [pieData, sim]);

	const getMarkedText = useCallback(async () => {
		const text = await Promise.all(
			sim.map(
				(item) =>
					new Promise((resolve, reject) => {
						const temp = getColorTags(item[0], item[1]);
						resolve(`${temp}`);
					})
			)
		);
		const ttext = text.join(". ");
		if (!edit) {
			const text1Element = document.getElementById("text1");
			text1Element.innerHTML = ttext;
		}
	}, [sim, edit]);

	useEffect(() => {
		getMarkedText();
	}, [sim, getMarkedText]);

	const handleSubmit = () => {
		axios
			.post("http://localhost:3001/data", {
				doc1: doc1,
				doc2: doc2,
			})
			.then((res) => {
				console.log(res);
				setTotSim(res.data.similarity);
				setSim(res.data.lineWise);
				setEdit(false);
			})
			.catch((err) => {
				console.log(err);
			});
	};

	const Editing = () => {
		return (
			<Box
				sx={{
					p: 3,
					backgroundColor: "skyblue",
					mb: 3,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-around",
				}}
			>
				<Box>
					<Typography
						variant="overline"
						sx={{ color: "black", fontWeight: "600", fontSize: "15px" }}
						textAlign="center"
					>
						NUMBER OF WORDS
					</Typography>
					<Typography
						variant="h4"
						sx={{ color: "black", fontWeight: "600" }}
						textAlign="center"
					>
						{doc1.length ? doc1.trim().split(" ").length : 0}
					</Typography>
				</Box>
				<Box>
					<Typography
						variant="overline"
						sx={{ color: "black", fontWeight: "600", fontSize: "15px" }}
						textAlign="center"
					>
						NUMBER OF WORDS
					</Typography>
					<Typography
						variant="h4"
						sx={{ color: "black", fontWeight: "600" }}
						textAlign="center"
					>
						{doc2.length ? doc2.trim().split(" ").length : 0}
					</Typography>
				</Box>
			</Box>
		);
	};

	const NotEditing = () => {
		return (
			<Grid
				container
				sx={{
					p: 2,
					backgroundColor: "skyblue",
					mb: 3,
					display: "flex",
					alignItems: "center",
					justifyContent: "space-around",
				}}
			>
				<Grid item xs={3} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<Typography variant="h4" sx={{ fontWeight: "bold" }}>
						SCANNED
					</Typography>
				</Grid>
				<Grid item xs={3} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<Typography variant="h6" sx={{ fontWeight: "bold" }}>
						TOTAL WORDS
					</Typography>
					<Typography variant="h6" sx={{ fontWeight: "bold" }}>
						{doc1.length ? doc1.trim().split(" ").length : 0}
					</Typography>
				</Grid>
				<Grid item xs={3} sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<PieChart
						data={pieData}
						// totalValue={100}
						totalValue={doc1.trim().split(" ").length}
						lineWidth={50}
						startAngle={-90}
						label={({ dataEntry }) => `${dataEntry.value}`}
						labelStyle={{
							fontSize: "10px",
							fontWeight: "bold",
							fill: "rgb(0,0,0)",
						}}
						labelPosition={75}
						segmentsStyle={{
							// transition: "stroke .3s",
							cursor: "pointer",
						}}
						segmentsShift={0}
						animate={true}
						style={{
							height: "150px",
							width: "150px",
							filter: "drop-shadow(0px 0px 20px rgba(0,0,0,0.7))",
						}}
						radius={50}
					/>
				</Grid>
				<Grid item sx={{display: "flex", flexDirection: "column", alignItems: "center"}}>
					<Typography
						variant="h4"
						sx={{ fontWeight: "bold" }}
						textAlign="center"
						color="red"
					>
						{totSim.toFixed(2)}%
					</Typography>
					<Typography
						variant="h5"
						sx={{ fontWeight: "bold" }}
						textAlign="center"
						color="red"
					>
						Match
					</Typography>
				</Grid >
			</Grid>
		);
	};

	const getList = () => {
		return sim.map((item, index) =>
			item[1] > 0 ? (
				<ListItem key={index}>
					<ListItemText
						sx={{
							boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.5)",
							p: 2,
							borderRadius: "10px",
						}}
					>
						<Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
							<span style={{ background: getColor(item[1]), padding: "5px" }}>
								{item[1]}
							</span>
						</Typography>
						<Typography variant="body1">{item[0]}</Typography>
						<hr />
						<Typography variant="body1">{item[2]}</Typography>
					</ListItemText>
				</ListItem>
			) : null
		);
	};

	return (
		<Box sx={{ p: 4 }}>
			<Paper elevation={5} sx={{ overflow: "hidden" }}>
				{!edit ? NotEditing() : Editing()}
				<Box
					sx={{
						display: "flex",
						justifyContent: "center",
						alignItems: "center",
					}}
				>
					<Container>
						{edit ? (
							<TextField
								label="Text 1"
								fullWidth
								multiline
								minRows={8}
								onChange={(e) => edit && setDoc1(e.target.value)}
								InputProps={{
									readOnly: !edit,
								}}
								value={doc1}
							/>
						) : (
							<div id="text1"></div>
						)}
					</Container>
					<Container>
						{edit ? (
							<TextField
								label="Text 2"
								fullWidth
								multiline
								minRows={8}
								onChange={(e) => edit && setDoc2(e.target.value)}
								InputProps={{
									readOnly: !edit,
								}}
								value={doc2}
							/>
						) : (
							<div id="text2">{doc2}</div>
						)}
					</Container>
				</Box>
				<Container sx={{ textAlign: "center", pb: 2 }}>
					<Button
						variant="contained"
						sx={{ mt: 4, mr: 2 }}
						onClick={handleSubmit}
						disabled={!edit}
					>
						Submit
					</Button>
					{!edit && (
						<Button
							variant="contained"
							sx={{ mt: 4, ml: 2 }}
							onClick={() => setEdit(true)}
							color="warning"
						>
							Edit
						</Button>
					)}
				</Container>
				<Container>{getList()}</Container>
			</Paper>
		</Box>
	);
};

export default App;
