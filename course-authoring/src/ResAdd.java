

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Servlet implementation class resAdd
 */
public class ResAdd extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public ResAdd() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		 //$call("GET", "resAdd.php?course_id=" + state.curr.course.id + "&name=" + name, null, function (res) { resAdd01_cb(res); }, true, false);
		response.setContentType("text/html");
		PrintWriter out = response.getWriter();
		String cid = request.getParameter("course_id"); 
		String name = request.getParameter("name");
		String usr = request.getParameter("usr");
		ConfigManager cm = new ConfigManager(this); // this object gets the
		AggregateDB agg_db = new AggregateDB(cm.agg_dbstring, cm.agg_dbuser, cm.agg_dbpass);
		agg_db.openConnection();
		boolean output = addRes(cid,name,usr,agg_db);		
		agg_db.closeConnection();		
		out.print(output);
	}

	private boolean addRes(String cid, String name, String usr, AggregateDB agg_db) {
		return agg_db.addRes(cid,name,usr);
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
