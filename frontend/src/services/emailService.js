import emailjs from "@emailjs/browser";

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const emailService = {

    sendNotification: async (
        worker,
        workOrder,
        schedule,
        notes
    ) => {

        const templateParams = {

            worker_name: worker.name,

            worker_email: worker.email,

            designation: worker.designation,

            department: worker.department,

            machine: workOrder.machine,

            work_order_id: workOrder.work_order_id || workOrder.id,

            priority: workOrder.priority,

            estimated_time: workOrder.estimated_time,

            assigned_team: workOrder.assigned_team,

            schedule,

            notes

        };

        console.log("========== EMAILJS ==========");
        console.log("SERVICE:", SERVICE_ID);
        console.log("TEMPLATE:", TEMPLATE_ID);
        console.log("PUBLIC:", PUBLIC_KEY);
        console.log("PARAMS:", templateParams);

        try {

            const response = await emailjs.send(

                SERVICE_ID,

                TEMPLATE_ID,

                templateParams,

                PUBLIC_KEY

            );

            console.log("EMAIL SENT:", response);

            return response;

        } catch (error) {

            console.error("EMAIL ERROR:", error);

            throw error;

        }

    }

};

export default emailService;